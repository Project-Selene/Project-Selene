using System.IO.Pipelines;

namespace ProjectSelene.Application.Storage.Commands.UploadArtifact;

static class StreamLimiter
{
    public static Stream Limit(Stream stream, long limit, CancellationToken cancellationToken)
    {
        var result = new Pipe();

        _ = CopyAndLimit(result.Writer, stream, limit, cancellationToken);

        return result.Reader.AsStream();
    }

    private static async Task CopyAndLimit(PipeWriter writer, Stream reader, long limit, CancellationToken cancellationToken)
    {
        long read = 0;
        while (!cancellationToken.IsCancellationRequested)
        {
            var memory = writer.GetMemory(512);
            int n;
            try
            {
                n = await reader.ReadAsync(memory, cancellationToken);
            }
            catch (Exception ex)
            {
                await writer.CompleteAsync(ex);
                break;
            }

            if (n == 0)
            {
                await writer.CompleteAsync();
                break;
            }

            if (n + read > limit)
            {
                await writer.CompleteAsync(new InvalidOperationException("Stream limit exceeded"));
                break;
            }

            writer.Advance(n);
            read += n;

            var flushResult = await writer.FlushAsync(cancellationToken);
            if (flushResult.IsCompleted)
            {
                await writer.CompleteAsync();
                break;
            }
        }
    }
}
