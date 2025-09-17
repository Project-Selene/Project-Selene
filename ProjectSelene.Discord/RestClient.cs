using Discord.Net.Rest;
using System.Collections.Immutable;
using System.Globalization;
using System.Text;

namespace ProjectSelene.Discord;

internal class RestClient(string baseUrl, HttpClient httpClient) : IRestClient
{
    private CancellationToken cancelToken = CancellationToken.None;
    private bool isDisposed;

    private void Dispose(bool disposing)
    {
        if (!isDisposed)
        {
            if (disposing)
            {
                httpClient.Dispose();
            }
            isDisposed = true;
        }
    }
    public void Dispose()
    {
        Dispose(true);
    }

    public void SetHeader(string key, string value)
    {
        httpClient.DefaultRequestHeaders.Remove(key);
        if (value != null)
        {
            httpClient.DefaultRequestHeaders.Add(key, value);
        }
    }
    public void SetCancelToken(CancellationToken cancelToken)
    {
        this.cancelToken = cancelToken;
    }

    public async Task<RestResponse> SendAsync(string method, string endpoint, CancellationToken cancelToken, bool headerOnly, string reason, IEnumerable<KeyValuePair<string, IEnumerable<string>>> requestHeaders)
    {
        string uri = Path.Combine(baseUrl, endpoint);
        using var restRequest = new HttpRequestMessage(HttpMethod.Parse(method), uri);
        SetRequestHeaders(restRequest, reason, requestHeaders);

        return await SendInternalAsync(restRequest, headerOnly, cancelToken).ConfigureAwait(false);
    }
    public async Task<RestResponse> SendAsync(string method, string endpoint, string json, CancellationToken cancelToken, bool headerOnly, string reason, IEnumerable<KeyValuePair<string, IEnumerable<string>>> requestHeaders)
    {
        string uri = Path.Combine(baseUrl, endpoint);
        using var restRequest = new HttpRequestMessage(HttpMethod.Parse(method), uri);
        SetRequestHeaders(restRequest, reason, requestHeaders);

        restRequest.Content = new StringContent(json, Encoding.UTF8, "application/json");
        return await SendInternalAsync(restRequest, headerOnly, cancelToken).ConfigureAwait(false);
    }

    public Task<RestResponse> SendAsync(string method, string endpoint, IReadOnlyDictionary<string, object> multipartParams, CancellationToken cancelToken, bool headerOnly, string reason, IEnumerable<KeyValuePair<string, IEnumerable<string>>> requestHeaders)
    {
        string uri = Path.Combine(baseUrl, endpoint);
        var restRequest = new HttpRequestMessage(HttpMethod.Parse(method), uri);
        SetRequestHeaders(restRequest, reason, requestHeaders);

        var content = new MultipartFormDataContent("Upload----" + DateTime.Now.ToString(CultureInfo.InvariantCulture));

        static StreamContent GetStreamContent(Stream stream)
        {
            if (stream.CanSeek)
            {
                // Reset back to the beginning; it may have been used elsewhere or in a previous request.
                stream.Position = 0;
            }

            return new StreamContent(stream);
        }

        foreach (var p in multipartParams ?? ImmutableDictionary<string, object>.Empty)
        {
            switch (p.Value)
            {
                case string stringValue:
                    { content.Add(new StringContent(stringValue, Encoding.UTF8, "text/plain"), p.Key); continue; }
                case byte[] byteArrayValue:
                    { content.Add(new ByteArrayContent(byteArrayValue), p.Key); continue; }
                case Stream streamValue:
                    { content.Add(GetStreamContent(streamValue), p.Key); continue; }
                //case MultipartFile fileValue:
                //    {
                //        var streamContent = GetStreamContent(fileValue.Stream);

                //        if (fileValue.ContentType != null)
                //        {
                //            streamContent.Headers.ContentType = new MediaTypeHeaderValue(fileValue.ContentType);
                //        }

                //        content.Add(streamContent, p.Key, fileValue.Filename);

                //        continue;
                //    }
                default:
                    throw new InvalidOperationException($"Unsupported param type \"{p.Value.GetType().Name}\".");
            }
        }

        restRequest.Content = content;
        return SendInternalAsync(restRequest, headerOnly, cancelToken);
    }

    private static void SetRequestHeaders(HttpRequestMessage restRequest, string reason, IEnumerable<KeyValuePair<string, IEnumerable<string>>> requestHeaders)
    {
        if (reason != null)
        {
            restRequest.Headers.Add("X-Audit-Log-Reason", Uri.EscapeDataString(reason));
        }

        if (requestHeaders != null)
        {
            foreach (var header in requestHeaders)
            {
                restRequest.Headers.Add(header.Key, header.Value);
            }
        }
    }

    private async Task<RestResponse> SendInternalAsync(HttpRequestMessage request, bool headerOnly, CancellationToken cancellationToken)
    {
        using var cancelTokenSource = CancellationTokenSource.CreateLinkedTokenSource(this.cancelToken, cancellationToken);

        HttpResponseMessage response = await httpClient.SendAsync(request, cancelTokenSource.Token).ConfigureAwait(false);

        var headers = response.Headers.ToDictionary(x => x.Key, x => x.Value.FirstOrDefault(), StringComparer.OrdinalIgnoreCase);
        var stream = (!headerOnly || !response.IsSuccessStatusCode)
            ? await response.Content.ReadAsStreamAsync(cancelTokenSource.Token).ConfigureAwait(false)
            : null;

        return new RestResponse(response.StatusCode, headers, stream);
    }
}
