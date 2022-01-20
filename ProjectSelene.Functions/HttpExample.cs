using System.Collections.Generic;
using System.IO;
using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace ProjectSelene.Functions
{
    public class HttpExample
    {
        private readonly ILogger _logger;
        private readonly SeleneDbContext context;

        public HttpExample(ILoggerFactory loggerFactory, SeleneDbContext context)
        {
            _logger = loggerFactory.CreateLogger<HttpExample>();
            this.context = context;
        }

        [Function("HttpExample")]
        public HttpResponseData Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequestData req)
        {
            _logger.LogInformation($"Url: {req.Url}");
            _logger.LogInformation("Headers");
            foreach (var header in req.Headers)
            {
                _logger.LogInformation($"{header.Key}: {string.Join(',', header.Value)}");
            }

            _logger.LogInformation("Body");
            _logger.LogInformation(new StreamReader(req.Body).ReadToEnd());

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "text/plain; charset=utf-8");

            response.WriteString($"{req.Url} {req.Headers} {new StreamReader(req.Body).ReadToEnd()}");

            return response;
        }
    }
}
