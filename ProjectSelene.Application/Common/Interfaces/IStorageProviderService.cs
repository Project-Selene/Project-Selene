namespace ProjectSelene.Application.Common.Interfaces;

public interface IStorageProviderService
{
    Task<Guid> Upload(Stream content, CancellationToken cancellationToken = default);
    Task<Stream> Download(Guid id, CancellationToken cancellationToken = default);
    Task Delete(Guid id, CancellationToken cancellationToken = default);
}
