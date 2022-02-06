namespace ProjectSelene.Functions;

internal class LoginController : AzureBaseController
{
    private readonly Login<HttpResponseData, HttpRequestData> login;

    public LoginController(ILoggerFactory loggerFactory, IConfiguration configuration, HttpClient httpClient)
    {
        login = new Login<HttpResponseData, HttpRequestData>(loggerFactory, configuration, httpClient, createResponse);
    }

    [Function("login")]
    public Task<HttpResponseData> Redirect([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req) => this.login.Redirect(req);

    [Function("completelogin")]
    public Task<HttpResponseData> Complete([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req) => this.login.Complete(req, req.Url.Query);
}
