using Microsoft.AspNetCore.Mvc;
using ProjectSelene.DTOs;
using ProjectSelene.Models;
using ProjectSelene.Services;
using System.Text.Json;

namespace ProjectSelene.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LoginController : Controller
{
    private readonly ILogger logger;
    private readonly string tokenIssuer;
    private readonly string githubTokenEndpoint;
    private readonly string discordTokenEndpoint;
    private readonly SymmetricSecurityKey jwtKey;
    private readonly HttpClient httpClient;
    private readonly LoginService loginService;
    private readonly LoginInfo loginInfo;
    private readonly SeleneDbContext context;
    private readonly IMapper mapper;

    private readonly JsonSerializerOptions jsonSnakeCase = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
    };

    public LoginController(ILoggerFactory loggerFactory, IConfiguration configuration, HttpClient httpClient, LoginService loginService, SeleneDbContext context, IMapper mapper)
    {
        var jwtSecret = configuration["jwt_secret"] ?? throw new ArgumentNullException("jwt_secret", "jwt_secret is required");

        this.logger = loggerFactory.CreateLogger<LoginController>();
        this.tokenIssuer = configuration["token_issuer"] ?? "";
        this.githubTokenEndpoint = $"https://github.com/login/oauth/access_token?client_id={configuration["github_client_id"]}&client_secret={configuration["github_client_secret"]}&redirect_uri={configuration["github_redirect_uri"]}&code=";
        this.discordTokenEndpoint = $"https://discord.com/api/oauth2/token?grant_type=authorization_code&client_id={configuration["discord_client_id"]}&client_secret={configuration["discord_client_secret"]}&redirect_uri={configuration["discord_redirect_uri"]}&code=";
        this.jwtKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
        this.httpClient = httpClient;
        this.loginService = loginService;
        this.context = context;
        this.mapper = mapper;

        this.loginInfo = new LoginInfo()
        {
            GithubUrl = $"https://github.com/login/oauth/authorize?client_id={configuration["github_client_id"]}&redirect_uri={configuration["github_redirect_uri"]}",
            DiscordUrl = $"https://discord.com/api/oauth2/authorize?response_type=code&scope=identify&prompt=none&client_id={configuration["discord_client_id"]}&redirect_uri={configuration["discord_redirect_uri"]}"
        };
    }

    [HttpGet]
    public LoginInfo Login() => this.loginInfo;


    [HttpPost("complete")]
    public async Task<ActionResult<string>> Complete(CompleteLogin dto)
    {
        if (dto.Type == LoginType.Github)
        {
            string code = dto.Token;
            if (string.IsNullOrWhiteSpace(code))
            {
                return BadRequest();
            }

            using var tokenResponse = await this.httpClient.GetAsync(githubTokenEndpoint + Uri.EscapeDataString(code));
            var tokens = await JsonSerializer.DeserializeAsync<GithubTokens>(tokenResponse.Content.ReadAsStream(), jsonSnakeCase);
            if (tokens == null || string.IsNullOrEmpty(tokens.TokenType))
            {
                return BadRequest();
            }

            var userDataRequest = new HttpRequestMessage(HttpMethod.Get, "https://api.github.com/user");
            userDataRequest.Headers.Authorization = new AuthenticationHeaderValue(tokens.TokenType, tokens.AccessToken);
            using var userDataResponse = await this.httpClient.SendAsync(userDataRequest);
            var userData = await JsonSerializer.DeserializeAsync<GithubUser>(userDataResponse.Content.ReadAsStream(), jsonSnakeCase);
            if (userData == null)
            {
                return BadRequest();
            }

            var user = await this.context.Users.FirstOrDefaultAsync(u => u.GithubId == userData.Id);
            if (user == null)
            {
                user = new User()
                {
                    GithubId = userData.Id
                };
                this.context.Users.Add(user);
            }
            user.Name = userData.Name ?? userData.Login;
            user.AvatarUrl = userData.AvatarUrl;
            await this.context.SaveChangesAsync();

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateEncodedJwt(new SecurityTokenDescriptor()
            {
                Issuer = this.tokenIssuer,
                SigningCredentials = new SigningCredentials(jwtKey, "HS256"),
                Claims = new Dictionary<string, object>()
                {
                    { ClaimTypes.NameIdentifier, user.Id }
                }
            });

            this.logger.LogInformation($"User {user.Id} ({user.Name}) logged in successfully using Github");

            return Ok(token);
        }
        else if (dto.Type == LoginType.Discord)
        {
            string code = dto.Token;
            if (string.IsNullOrWhiteSpace(code))
            {
                return BadRequest();
            }

            using var tokenResponse = await this.httpClient.GetAsync(discordTokenEndpoint + Uri.EscapeDataString(code));
            var tokens = await JsonSerializer.DeserializeAsync<DiscordTokens>(tokenResponse.Content.ReadAsStream(), jsonSnakeCase);
            if (tokens == null || string.IsNullOrEmpty(tokens.TokenType))
            {
                return BadRequest();
            }

            var userDataRequest = new HttpRequestMessage(HttpMethod.Get, "https://discord.com/api/v10/users/@me");
            userDataRequest.Headers.Authorization = new AuthenticationHeaderValue(tokens.TokenType, tokens.AccessToken);
            using var userDataResponse = await this.httpClient.SendAsync(userDataRequest);
            var userData = await JsonSerializer.DeserializeAsync<DiscordUser>(userDataResponse.Content.ReadAsStream(), jsonSnakeCase);
            if (userData == null)
            {
                return BadRequest();
            }

            var user = await this.context.Users.FirstOrDefaultAsync(u => u.DiscordId == userData.Id);
            if (user == null)
            {
                user = new User()
                {
                    DiscordId = userData.Id
                };
                this.context.Users.Add(user);
            }
            user.Name = userData.GlobalName ?? userData.Username;
            if (userData.Avatar != null)
            {
                user.AvatarUrl = "https://cdn.discordapp.com/" + user.DiscordId + "/" + userData.Avatar + ".png";
            }

            await this.context.SaveChangesAsync();

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateEncodedJwt(new SecurityTokenDescriptor()
            {
                Issuer = this.tokenIssuer,
                SigningCredentials = new SigningCredentials(jwtKey, "HS256"),
                Claims = new Dictionary<string, object>()
                {
                    { ClaimTypes.NameIdentifier, user.Id }
                }
            });
            this.logger.LogInformation($"User {user.Id} ({user.Name}) logged in successfully using Discord");

            return Ok(token);
        }
        else
        {
            return BadRequest();
        }
    }

    [HttpGet("loggedin")]
    public bool IsLoggedIn() => this.loginService.IsLoggedIn(HttpContext);

    [HttpGet("current")]
    public async Task<ActionResult<UserInfo>> CurrentUser()
    {
        var user = await this.loginService.GetUser(HttpContext);
        if (user == null)
        {
            return Unauthorized();
        }
        return this.mapper.Map<UserInfo>(user);
    }


    private record GithubTokens
    {
        public string AccessToken { get; set; } = string.Empty;
        public string Scope { get; set; } = string.Empty;
        public string TokenType { get; set; } = string.Empty;
    }

    private record GithubUser
    {
        public int Id { get; set; }
        public string Login { get; set; } = string.Empty;
        public string? Name { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
    }

    private record DiscordTokens
    {
        public string AccessToken { get; set; } = string.Empty;
        public string Scope { get; set; } = string.Empty;
        public string TokenType { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public int ExpiresIn { get; set; }
    }

    private record DiscordUser
    {
        public ulong Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? GlobalName { get; set; }
        public string? Avatar { get; set; }
    }
}
