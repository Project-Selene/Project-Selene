using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Web;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace ProjectSelene.Functions;

public class Login
{
    private readonly ILogger logger;
    private readonly string githubAuthorizeEndpoint;
    private readonly string githubTokenEndpoint;
    private readonly byte[] jwtKey;
    private readonly HttpClient httpClient;

    public Login(ILoggerFactory loggerFactory, IConfiguration configuration, HttpClient httpClient)
    {
        logger = loggerFactory.CreateLogger<Login>();
        githubAuthorizeEndpoint = $"https://github.com/login/oauth/authorize?client_id={configuration["github_client_id"]}&scope=read:user";
        githubTokenEndpoint = $"https://github.com/login/oauth/access_token?client_id={configuration["github_client_id"]}&client_secret={configuration["github_client_secret"]}&code=";
        jwtKey = Encoding.UTF8.GetBytes(configuration["jwt_secret"]);
        this.httpClient = httpClient;
    }

    [Function("login")]
    public HttpResponseData Redirect([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
    {
        var response = req.CreateResponse(HttpStatusCode.Redirect);

        response.Headers.Add("Location", this.githubAuthorizeEndpoint);

        return response;
    }

    [Function("completelogin")]
    public async Task<HttpResponseData> Complete([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
    {
        var query = HttpUtility.ParseQueryString(req.Url.Query);
        string code = query.Get("code");
        if (string.IsNullOrWhiteSpace(code))
        {
            return req.CreateResponse(HttpStatusCode.BadRequest);
        }

        using var tokenResponse = await this.httpClient.GetAsync(githubTokenEndpoint + Uri.EscapeDataString(code));
        var tokens = await JsonSerializer.DeserializeAsync<GithubTokens>(tokenResponse.Content.ReadAsStream());

        var userDataRequest = new HttpRequestMessage(HttpMethod.Get, "https://api.github.com/user");
        userDataRequest.Headers.Authorization = new AuthenticationHeaderValue(tokens.token_type, tokens.access_token);
        using var userDataResponse = await this.httpClient.SendAsync(userDataRequest);
        var userData = await JsonSerializer.DeserializeAsync<GithubUser>(userDataResponse.Content.ReadAsStream());

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

        var response = req.CreateResponse(HttpStatusCode.OK);

        response.WriteString(token);

        return response;
    }

    private record GithubTokens
    {
        public string access_token { get; set; }
        public string scope { get; set; }
        public string token_type { get; set; }
    }

    private record GithubUser
    {
        public int id { get; set; }
    }
}
