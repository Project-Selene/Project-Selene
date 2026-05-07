using Microsoft.Extensions.Options;
using ProjectSelene.Domain.Configuration;

namespace ProjectSelene.Application.Mods.Commands.RegisterVersion;

[Authorize]
public record RegisterVersionCommand : IRequest<Result>
{
    public required Guid ModId { get; init; }
    public required string Version { get; init; }

    public required string Name { get; set; }
    public required string Description { get; set; }
}

public class RegisterVersionCommandHandler(IApplicationDbContext context, IUser user) : IRequestHandler<RegisterVersionCommand, Result>
{
    public async ValueTask<Result> Handle(RegisterVersionCommand request, CancellationToken cancellationToken)
    {
        var mod = await context.Mods
            .Include(m => m.Versions)
            .FirstOrDefaultAsync(m => m.Guid == request.ModId, cancellationToken);

        if (mod == null)
        {
            mod ??= new()
            {
                Guid = request.ModId,
                Info = new() { Description = "", Name = "" },
                CreatedById = user.Id,
                Created = DateTime.UtcNow
            };
            context.Mods.Add(mod);
        }

        mod.Versions.Add(new()
        {
            Version = request.Version,
            Mod = mod,
            CreatedById = user.Id,
            Created = DateTime.UtcNow,
            ChangeRequests = [new() {
                CreatedById = user.Id,
                Created = DateTime.UtcNow,
                ModInfo = new()
            {
                CreatedById = user.Id,
                Created = DateTime.UtcNow,
                Name = request.Name,
                Description = request.Description
            }}],
        });

        await context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

public class UploadVersionCommandValidator : AbstractValidator<RegisterVersionCommand>
{
    private readonly IApplicationDbContext dbContext;
    private readonly IOptions<LimitConfig> limitConfig;
    private readonly IUser user;

    public UploadVersionCommandValidator(IApplicationDbContext dbContext, IOptions<LimitConfig> limitConfig, IUser user)
    {
        this.dbContext = dbContext;
        this.limitConfig = limitConfig;
        this.user = user;

        RuleFor(v => v.ModId)
            .NotEmpty();

        RuleFor(v => v.Version)
            .Matches(@"^\d+\.\d+\.\d+$")
            .MaximumLength(16);

        RuleFor(v => v.Version)
            .MustAsync(NotExist)
            .WithMessage("The specified version already exists.");

        RuleFor(v => v)
            .MustAsync(NotExceedLimit)
            .WithMessage("You have exceeded the maximum number of submitted but unverified versions.");
    }

    private async Task<bool> NotExist(RegisterVersionCommand command, string version, CancellationToken cancellationToken)
    {
        return !await dbContext.ModVersions
            .AnyAsync(v => v.Mod.Guid == command.ModId && v.Version == version && v.VerifiedBy != null, cancellationToken);
    }

    private async Task<bool> NotExceedLimit(RegisterVersionCommand _, CancellationToken cancellationToken)
    {
        return await dbContext.ModVersions
            .CountAsync(v => v.CreatedById == user.Id && v.VerifiedBy == null, cancellationToken) < limitConfig.Value.MaxVersions;
    }
}
