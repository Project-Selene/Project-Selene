namespace ProjectSelene.Services;

public interface IStorageProviderService
{
    Task<string> Upload(Stream content, CancellationToken cancellationToken = default);
    Task Download(string id, Stream target, CancellationToken cancellationToken = default);
    Task Delete(string id, CancellationToken cancellationToken = default);
}
