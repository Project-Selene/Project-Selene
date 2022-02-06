using System.Net;

namespace ProjectSelene.Functions;

internal class AzureBaseController
{
    protected async Task<HttpResponseData> createResponse(HttpRequestData request, HttpStatusCode status, object? result, IDictionary<string, string>? headers)
    {
        var response = request.CreateResponse(status);
        if (headers != null)
        {
            foreach (var header in headers)
            {
                response.Headers.Add(header.Key, header.Value);
            }
        }

        if (result != null)
        {
            switch (result)
            {
                case string text:
                    await response.WriteStringAsync(text);
                    break;
                case byte[] bytes:
                    await response.WriteBytesAsync(bytes);
                    break;
                default:
                    await response.WriteAsJsonAsync(result);
                    break;
            }
        }


        return response;
    }
}
