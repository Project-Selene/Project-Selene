using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Primitives;
using System.Net;

namespace ProjectSelene.Functions;

internal class AzureBaseController
{
    private readonly DefaultHttpContextFactory contextFactory;
    private readonly IServiceProvider serviceProvider;

    protected AzureBaseController(IServiceProvider serviceProvider)
    {
        contextFactory = new DefaultHttpContextFactory(serviceProvider);
        this.serviceProvider = serviceProvider;
    }

    protected async Task<HttpResponseData> DoActionRequest<T, R>(HttpRequestData req, T controller, Func<T, Task<R>> action)
        where T : Controller
        where R : ActionResult
    {
        var (resp, ctx) = SetupController(controller, req);
        var result = await action(controller);
        await CompleteActionResult(req, resp, ctx, result);
        return resp;
    }
    protected async Task<HttpResponseData> DoGenericActionRequest<T, R>(HttpRequestData req, T controller, Func<T, Task<R>> action)
        where T : Controller
        where R : IConvertToActionResult
    {
        var (resp, ctx) = SetupController(controller, req);
        var result = await action(controller);
        await CompleteActionResult(req, resp, ctx, ((IConvertToActionResult)result).Convert());
        return resp;
    }


    private (HttpResponseData, HttpContext) SetupController(Controller controller, HttpRequestData req)
    {
        var features = new FeatureCollection();

        features[typeof(IQueryFeature)] = new QueryFeature(new QueryCollection());

        features[typeof(IHttpRequestFeature)] = new HttpRequestFeature()
        {
            Path = req.Url.AbsolutePath,
            Method = req.Method,
            Headers = new HeaderDictionary(req.Headers.ToDictionary(kv => kv.Key, kv => new StringValues(kv.Value.ToArray()))),
            RawTarget = req.Url.OriginalString,
            QueryString = req.Url.Query,
            Scheme = req.Url.Scheme,
            Body = req.Body,
            //PathBase = "",
            //Protocol = "",
        };

        var resp = req.CreateResponse();
        features[typeof(IHttpResponseFeature)] = new HttpResponseFeature()
        {
            Body = resp.Body,
        };

        features[typeof(IHttpResponseBodyFeature)] = new StreamResponseBodyFeature(resp.Body);

        features[typeof(IServiceProvidersFeature)] = new ServiceProvidersFeature() { RequestServices = serviceProvider };

        var result = contextFactory.Create(features);
        controller.ControllerContext.HttpContext = result;
        return (resp, result);
    }

    private async Task CompleteActionResult(HttpRequestData req, HttpResponseData resp, HttpContext ctx, IActionResult result)
    {
        var actionDesciptor = new ActionDescriptor();
        await result.ExecuteResultAsync(new ActionContext(ctx, new RouteData(), actionDesciptor));
        resp.StatusCode = (HttpStatusCode)ctx.Response.StatusCode;
        foreach (var header in ctx.Response.Headers)
        {
            resp.Headers.Add(header.Key, (IEnumerable<string>)header.Value);
        }
    }
}
