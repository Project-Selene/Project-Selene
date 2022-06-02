using ProjectSelene.Controllers;
using System.Net;
using System.Web;

namespace ProjectSelene.Functions;

internal class HttpExample : AzureBaseController
{
    private readonly LoginController login;

    public HttpExample(IServiceProvider serviceProvider, LoginController login) : base(serviceProvider)
    {
        this.login = login;
    }

    [Function("HttpExample")]
    public HttpResponseData Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequestData req)
    {
        var response = req.CreateResponse(HttpStatusCode.OK);
        response.Headers.Add("Content-Type", "text/plain; charset=utf-8");

        var query = HttpUtility.ParseQueryString(req.Url.Query);
        string token = query.Get("token")!;

        //response.WriteString($"Hello: {string.Join("; ", this.login.GetUser(token).Claims.Select(c => c.Type + ' ' + c.Value))}");

        return response;
    }
}
