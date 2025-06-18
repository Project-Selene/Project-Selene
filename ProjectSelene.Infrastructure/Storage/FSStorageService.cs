using Microsoft.Extensions.Options;
using ProjectSelene.Application.Common.Interfaces;

namespace ProjectSelene.Infrastructure.Storage;

public record FSStorageConfig
{
    public required string FSDirectory { get; set; }
}

public class FSStorageService(IOptions<FSStorageConfig> configuration) : IStorageProviderService
{
    private readonly string folder = configuration.Value?.FSDirectory ?? throw new ArgumentNullException("FSDirectory", "Storage:FSDirectory is required for FSStorageService");

    public async Task<Guid> Upload(Stream content, CancellationToken cancellationToken)
    {
        var id = Guid.NewGuid();
        Directory.GetParent(this.folder)?.Create();
        using var fs = File.OpenWrite(Path.Combine(this.folder, id.ToString()));
        await content.CopyToAsync(fs, cancellationToken);
        return id;
    }

    public Task<Stream> Download(Guid id, CancellationToken cancellationToken)
    {
        return Task.FromResult<Stream>(File.OpenRead(Path.Combine(this.folder, id.ToString())));
    }

    public Task Delete(Guid id, CancellationToken cancellationToken)
    {
        File.Delete(Path.Combine(this.folder, id.ToString()));
        return Task.CompletedTask;
    }
}
