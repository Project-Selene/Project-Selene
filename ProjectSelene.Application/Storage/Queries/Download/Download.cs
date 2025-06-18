using ProjectSelene.Domain.Events;

namespace ProjectSelene.Application.Storage.Queries.Download;

[Authorize(Policy = Policies.CAN_SEE_ALL_MODS, AllowOwner = true, AllowAnonymousIfVerified = true)]
public record Download : IRequest<DownloadDto>, IModRequest
{
    public required Guid ModId { get; init; }
    public required string Version { get; init; }
}

public class DownloadValidator : AbstractValidator<Download>
{
    public DownloadValidator()
    {
        RuleFor(v => v.ModId)
            .NotEmpty();
        RuleFor(v => v.Version)
            .Matches(@"^\d+\.\d+\.\d+$")
            .MaximumLength(16);
    }
}

public class DownloadHandler(IApplicationDbContext context, IStorageProviderService storage) : IRequestHandler<Download, DownloadDto>
{
    public async Task<DownloadDto> Handle(Download request, CancellationToken cancellationToken)
    {
        var download = await context.ModVersions
            .Where(m =>
                m.Mod.Guid == request.ModId
                && m.Version == request.Version)
            .Select(m => m.Download)
            .FirstOrDefaultAsync(cancellationToken);
        if (download == null)
        {
            throw new FileNotFoundException("No download found for requested version");
        }

        download.AddDomainEvent(new ArtifactDownloadEvent(download.Id));
        await context.SaveChangesAsync(cancellationToken);

        var stream = await storage.Download(download.Guid, cancellationToken);
        return new DownloadDto() { LastModified = download.Created, Stream = stream };
    }
}
