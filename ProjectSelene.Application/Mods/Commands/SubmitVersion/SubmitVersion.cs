using ProjectSelene.Domain.Events;
using ProjectSelene.Domain.Exceptions;

namespace ProjectSelene.Application.Mods.Commands.SubmitVersion;

[Authorize(Policy = Policies.NOBODY, AllowOwner = true)]
public record SubmitVersionCommand : IRequest<Result>, IModRequest
{
    public required Guid ModId { get; init; }
    public required string Version { get; init; }
}
public class SubmitVersionCommandValidator : AbstractValidator<SubmitVersionCommand>
{
    public SubmitVersionCommandValidator()
    {
        RuleFor(v => v.ModId)
            .NotEmpty();

        RuleFor(v => v.Version)
            .Matches(@"^\d+\.\d+\.\d+$")
            .MaximumLength(16);
    }
}


public class SubmitVersionCommandHandler(IApplicationDbContext context, IUser user) : IRequestHandler<SubmitVersionCommand, Result>
{
    public async Task<Result> Handle(SubmitVersionCommand request, CancellationToken cancellationToken)
    {
        var version = await context.ModVersions
            .FirstOrDefaultAsync(m => m.Mod.Guid == request.ModId && m.Version == request.Version && m.CreatedBy != null && m.CreatedBy.Id == user.Id
            , cancellationToken)
            ?? throw new ModNotFoundException(request.ModId);

        version.SubmittedOn = DateTime.Now;
        version.AddDomainEvent(new VersionSubmittedEvent(version.Id));

        await context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
