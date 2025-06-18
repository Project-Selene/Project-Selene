namespace ProjectSelene.Application.Mods.Commands.RegisterVersion;

[Authorize]
public record RegisterVersionCommand : IRequest<Result>
{
    public required Guid ModId { get; init; }
    public required string Version { get; init; }

    public required string Name { get; set; }
    public required string Description { get; set; }
}
public class UploadVersionCommandValidator : AbstractValidator<RegisterVersionCommand>
{
    public UploadVersionCommandValidator()
    {
        RuleFor(v => v.ModId)
            .NotEmpty();

        RuleFor(v => v.Version)
            .Matches(@"^\d+\.\d+\.\d+$")
            .MaximumLength(16);
    }
}

public class RegisterVersionCommandHandler(IApplicationDbContext context) : IRequestHandler<RegisterVersionCommand, Result>
{
    public async Task<Result> Handle(RegisterVersionCommand request, CancellationToken cancellationToken)
    {
        var mod = await context.Mods
            .Include(m => m.Versions)
            .FirstOrDefaultAsync(m => m.Guid == request.ModId, cancellationToken);

        mod ??= new()
        {
            Guid = request.ModId,
            Info = new() { Description = "", Name = "" }
        };

        mod.Versions.Add(new()
        {
            Mod = mod,
            ChangeRequests = [new() { ModInfo = new()
            {
                Name = request.Name,
                Description = request.Description
            }}],
        });

        await context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
