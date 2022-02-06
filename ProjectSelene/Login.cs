using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;

namespace ProjectSelene;

public class Login<T, R>
{
    private readonly ILogger logger;
    private readonly string githubAuthorizeEndpoint;
    private readonly string githubTokenEndpoint;
    private readonly byte[] jwtKey;
    private readonly HttpClient httpClient;
    private readonly ResultFactory<T, R> createResponse;

    public Login(ILoggerFactory loggerFactory, IConfiguration configuration, HttpClient httpClient, ResultFactory<T, R> resultFactory)
    {
        this.logger = loggerFactory.CreateLogger<Login<T, R>>();
        this.githubAuthorizeEndpoint = $"https://github.com/login/oauth/authorize?client_id={configuration["github_client_id"]}&scope=read:user";
        this.githubTokenEndpoint = $"https://github.com/login/oauth/access_token?client_id={configuration["github_client_id"]}&client_secret={configuration["github_client_secret"]}&code=";
        this.jwtKey = Encoding.UTF8.GetBytes(configuration["jwt_secret"]);
        this.httpClient = httpClient;
        this.createResponse = resultFactory;
    }

    public Task<T> Redirect(R request)
    {
        return this.createResponse(request, HttpStatusCode.Redirect, headers: new Dictionary<string, string>()
        {
            { "Location", this.githubAuthorizeEndpoint }
        });
    }

    public async Task<T> Complete(R request, string queryString)
    {
        var query = HttpUtility.ParseQueryString(queryString);
        string code = query.Get("code")!;
        if (string.IsNullOrWhiteSpace(code))
        {
            return await this.createResponse(request, HttpStatusCode.BadRequest);
        }

        using var tokenResponse = await this.httpClient.GetAsync(githubTokenEndpoint + Uri.EscapeDataString(code));
        var tokens = await JsonSerializer.DeserializeAsync<GithubTokens>(tokenResponse.Content.ReadAsStream());
        if (tokens == null)
        {
            return await this.createResponse(request, HttpStatusCode.BadRequest);
        }

        var userDataRequest = new HttpRequestMessage(HttpMethod.Get, "https://api.github.com/user");
        userDataRequest.Headers.Authorization = new AuthenticationHeaderValue(tokens.token_type, tokens.access_token);
        using var userDataResponse = await this.httpClient.SendAsync(userDataRequest);
        var userData = await JsonSerializer.DeserializeAsync<GithubUser>(userDataResponse.Content.ReadAsStream());
        if (userData == null)
        {
            return await this.createResponse(request, HttpStatusCode.BadRequest);
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateEncodedJwt(new SecurityTokenDescriptor()
        {
            Issuer = "https://functionsproject.azurewebsites.net/",
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(jwtKey), "HS256"),
            Claims = new Dictionary<string, object>()
            {
                { ClaimTypes.NameIdentifier, userData.id }
            }
        });

        this.logger.LogInformation($"User {userData.id} logged in successfully");

        return await this.createResponse(request, HttpStatusCode.OK, token);
    }

    public ClaimsPrincipal GetUser(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();

        if (string.IsNullOrEmpty(token) || !tokenHandler.CanReadToken(token))
        {
            return new ClaimsPrincipal();
        }

        try
        {
            return tokenHandler.ValidateToken(token, new TokenValidationParameters()
            {
                IssuerSigningKey = new SymmetricSecurityKey(this.jwtKey),
                ValidateIssuer = true,
                ValidateIssuerSigningKey = true,
                ValidateAudience = false,
                ValidIssuer = "https://functionsproject.azurewebsites.net/",
                ValidAlgorithms = new[] { "HS256" }
            }, out var _);
        } 
        catch
        {
            return new ClaimsPrincipal();
        }
    }

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
