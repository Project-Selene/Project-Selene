using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace ProjectSelene.Web;

public class LoginController : Controller
{
    private readonly Login<IActionResult, HttpContext> login;

    public LoginController(ILoggerFactory loggerFactory, IConfiguration configuration, HttpClient httpClient)
    {
        login = new Login<IActionResult, HttpContext>(loggerFactory, configuration, httpClient, createResponse);
    }

    private async Task<IActionResult> createResponse(HttpContext request, HttpStatusCode status, object? result, IDictionary<string, string>? headers)
    {
        request.Response.StatusCode = (int)status;

        if (headers != null)
        {
            foreach (var header in headers)
            {
                request.Response.Headers.Add(header.Key, header.Value);
            }
        }

        if (result != null)
        {
            switch (result)
            {
                case string text:
                    await request.Response.WriteAsync(text);
                    break;
                case byte[] bytes:
                    await request.Response.Body.WriteAsync(bytes);
                    break;
                default:
                    await request.Response.WriteAsJsonAsync(result);
                    break;
            }
        }

        return new EmptyResult();
    }

    [HttpGet("login")]
    public Task<IActionResult> Redirect() => this.login.Redirect(HttpContext);

    [HttpGet("completelogin")]
    public Task<IActionResult> Complete() => this.login.Complete(HttpContext, HttpContext.Request.QueryString.ToUriComponent());
}
