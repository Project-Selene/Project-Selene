
using ProjectSelene.Domain.Exceptions;

namespace ProjectSelene.Application.Storage.Commands.UploadArtifact;

[Authorize(Policy = Policies.CAN_UPLOAD_FOR_OTHERS, AllowOwner = true)]
public record UploadArtifactCommand : IRequest<Result>, IModRequest
{
    public const int MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB

    public required Guid ModId { get; init; }
    public required string Version { get; init; }
    public required Stream Content { get; init; }
}

public class UploadArtifactCommandValidator : AbstractValidator<UploadArtifactCommand>
{
    public UploadArtifactCommandValidator()
    {
        RuleFor(v => v.ModId)
            .NotEmpty();

        RuleFor(v => v.Version)
            .Matches(@"^\d+\.\d+\.\d+$")
            .MaximumLength(16);

        RuleFor(v => v.Content)
            .NotNull();
    }
}

public class UploadArtifactCommandHandler(IApplicationDbContext context, IUser user, IStorageProviderService storage) : IRequestHandler<UploadArtifactCommand, Result>
{
    public async Task<Result> Handle(UploadArtifactCommand request, CancellationToken cancellationToken)
    {
        var version = await context.ModVersions
            .Include(m => m.Download)
            .FirstOrDefaultAsync(m =>
                m.Mod.Guid == request.ModId
                && m.Version == request.Version
                && m.CreatedById == user.Id,
                cancellationToken)
            ?? throw new ModNotFoundException(request.ModId);

        if (version.VerifiedBy != null)
        {
            throw new InvalidOperationException("Cannot upload a new artifact for a verified version");
        }

        if (version.Download != null)
        {
            await storage.Delete(version.Download.Guid, cancellationToken);
        }

        using var limitedStream = StreamLimiter.Limit(request.Content, UploadArtifactCommand.MAX_UPLOAD_SIZE, cancellationToken);

        var id = await storage.Upload(limitedStream, cancellationToken);
        version.Download = new()
        {
            Guid = id,
        };

        await context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
