using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;

namespace ProjectSelene.Services;

public class FSStorageService : IStorageProviderService
{
    private readonly string folder;

    public FSStorageService(IConfiguration configuration)
    {
        this.folder = configuration["fs_directory"] ?? throw new ArgumentNullException("fs_directory", "fs_directory is required for FSStorageService");
    }

    public async Task<string> Upload(Stream content, CancellationToken cancellationToken)
    {
        string id = Guid.NewGuid().ToString();
        Directory.GetParent(this.folder)?.Create();
        using var fs = File.OpenWrite(Path.Combine(this.folder, id));
        await content.CopyToAsync(fs).WaitAsync(cancellationToken);
        return id;
    }

    public async Task Download(string id, Stream target, CancellationToken cancellationToken)
    {
        using var fs = File.OpenRead(Path.Combine(this.folder, id));
        await fs.CopyToAsync(target).WaitAsync(cancellationToken);
    }

    public Task Delete(string id, CancellationToken cancellationToken)
    {
        File.Delete(Path.Combine(this.folder, id));
        return Task.CompletedTask;
    }
}
