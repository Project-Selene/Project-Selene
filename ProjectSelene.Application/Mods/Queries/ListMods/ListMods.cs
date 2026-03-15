namespace ProjectSelene.Application.Mods.Queries.ListMods;

public record ListModsQuery : IRequest<ModListDto>;

public class ListModsQueryHandler(IUser user, IApplicationDbContext context, IIdentityService identityService) : IRequestHandler<ListModsQuery, ModListDto>
{
    public async Task<ModListDto> Handle(ListModsQuery request, CancellationToken cancellationToken)
    {
        if (user.Id != null && await identityService.AuthorizeAsync(user.Id, Policies.CAN_SEE_ALL_MODS))
        {
            return new ModListDto()
            {
                Mods = await context.Mods
                    .OrderBy(x => x.Info.Name)
                    .Select(src => new ModDto()
                    {
                        Id = src.Guid,
                        Name = src.Info.Name,
                        Description = src.Info.Description,
                        Author = src.CreatedBy != null ? src.CreatedBy.UserName ?? "Unknown User" : "Unknown User",
                        Version = src.LatestVersion != null ? src.LatestVersion.Version : "?.?.?",
                        Versions = src.Versions.Select(v => v.Version),
                    })
                    .ToListAsync(cancellationToken)
            };
        }

        var userId = user.Id;
        return new ModListDto()
        {
            Mods = await context.Mods
                .Where(x => x.Versions.Any(v => v.VerifiedBy != null || (v.CreatedBy != null && v.CreatedBy.Id == userId)))
                .OrderBy(x => x.Info.Name)
                .Select(src => new ModDto()
                {
                    Id = src.Guid,
                    Name = src.Info.Name,
                    Description = src.Info.Description,
                    Author = src.CreatedBy != null ? src.CreatedBy.UserName ?? "Unknown User" : "Unknown User",
                    Version = src.LatestVersion != null ? src.LatestVersion.Version : "?.?.?",
                    Versions = src.Versions.Select(v => v.Version),
                })
                .ToListAsync(cancellationToken)
        };
    }
}
