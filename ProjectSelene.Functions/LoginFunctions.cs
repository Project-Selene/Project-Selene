namespace ProjectSelene.Functions;

internal class LoginFunctions : AzureBaseController
{
    private readonly LoginController login;

    public LoginFunctions(IServiceProvider serviceProvider, LoginController login) : base(serviceProvider)
    {
        this.login = login;
    }

    [Function("login")]
    public Task<HttpResponseData> RedirectLogin([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        => DoActionRequest(req, login, login => login.Login());

    [Function("completelogin")]
    public Task<HttpResponseData> Complete([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        => DoGenericActionRequest(req, login, login => login.Complete());

}
