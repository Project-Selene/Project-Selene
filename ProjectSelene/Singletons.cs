using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace ProjectSelene;

public static class Singletons
{
    public static void Register(IServiceCollection services)
    { 
        var options = new MvcOptions();

        options.OutputFormatters.Add(new SystemTextJsonOutputFormatter(new JsonSerializerOptions()));

        services.AddSingleton(Options.Create(options));
        services.AddSingleton<IUrlHelperFactory, UrlHelperFactory>();
        services.AddSingleton<IActionResultExecutor<RedirectResult>, RedirectResultExecutor>();
        services.AddSingleton<IHttpResponseStreamWriterFactory, StreamWriterFactory>();
        services.AddSingleton<OutputFormatterSelector, DefaultOutputFormatterSelector>();
        services.AddSingleton<IActionResultExecutor<ObjectResult>, ObjectResultExecutor>();
    }

    private class StreamWriterFactory : IHttpResponseStreamWriterFactory
    {
        public TextWriter CreateWriter(Stream stream, Encoding encoding) => new StreamWriter(stream, encoding);
    }
}
