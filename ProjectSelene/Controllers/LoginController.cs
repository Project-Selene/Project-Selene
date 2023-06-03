using System.IdentityModel.Tokens.Jwt;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Tokens;
using ProjectSelene.Services;

namespace ProjectSelene.Controllers;

public class LoginController : Controller
{
    private readonly ILogger logger;
    private readonly string githubAuthorizeEndpoint;
    private readonly string githubTokenEndpoint;
    private readonly SymmetricSecurityKey jwtKey;
    private readonly HttpClient httpClient;
    private readonly LoginService loginService;

    public LoginController(ILoggerFactory loggerFactory, IConfiguration configuration, HttpClient httpClient, LoginService loginService)
    {
        this.logger = loggerFactory.CreateLogger<LoginController>();
        this.githubAuthorizeEndpoint = $"https://github.com/login/oauth/authorize?client_id={configuration["github_client_id"]}&scope=read:user";
        this.githubTokenEndpoint = $"https://github.com/login/oauth/access_token?client_id={configuration["github_client_id"]}&client_secret={configuration["github_client_secret"]}&code=";
        this.jwtKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["jwt_secret"]));
        this.httpClient = httpClient;
        this.loginService = loginService;
    }

    [HttpGet("login")]
    public Task<RedirectResult> Login()
    {
        return Task.FromResult(Redirect(this.githubAuthorizeEndpoint));
    }


    [HttpGet("login/url")]
    public Task<string> LoginURL()
    {
        return Task.FromResult(this.githubAuthorizeEndpoint);
    }

    [ApiExplorerSettings(IgnoreApi = true)]
    [HttpGet("completelogin")]
    public async Task<ActionResult<string>> Complete()
    {
        string queryString = HttpContext.Request.QueryString.ToUriComponent();
        var query = HttpUtility.ParseQueryString(queryString);
        string code = query.Get("code")!;
        if (string.IsNullOrWhiteSpace(code))
        {
            return BadRequest();
        }

        using var tokenResponse = await this.httpClient.GetAsync(githubTokenEndpoint + Uri.EscapeDataString(code));
        var tokens = await JsonSerializer.DeserializeAsync<GithubTokens>(tokenResponse.Content.ReadAsStream());
        if (tokens == null || string.IsNullOrEmpty(tokens.token_type))
        {
            return BadRequest();
        }

        var userDataRequest = new HttpRequestMessage(HttpMethod.Get, "https://api.github.com/user");
        userDataRequest.Headers.Authorization = new AuthenticationHeaderValue(tokens.token_type, tokens.access_token);
        using var userDataResponse = await this.httpClient.SendAsync(userDataRequest);
        var userData = await JsonSerializer.DeserializeAsync<GithubUser>(userDataResponse.Content.ReadAsStream());
        if (userData == null)
        {
            return BadRequest();
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateEncodedJwt(new SecurityTokenDescriptor()
        {
            Issuer = "https://functionsproject.azurewebsites.net/",
            SigningCredentials = new SigningCredentials(jwtKey, "HS256"),
            Claims = new Dictionary<string, object>()
            {
                { ClaimTypes.NameIdentifier, userData.id }
            }
        });

        this.logger.LogInformation($"User {userData.id} logged in successfully");

        return Ok(token);
    }

    [HttpGet("loggedin")]
    public bool IsLoggedIn() => this.loginService.IsLoggedIn(HttpContext);


    private record GithubTokens
    {
        public string access_token { get; set; } = string.Empty;
        public string scope { get; set; } = string.Empty;
        public string token_type { get; set; } = string.Empty;
    }

    private record GithubUser
    {
        public int id { get; set; }
    }
}
