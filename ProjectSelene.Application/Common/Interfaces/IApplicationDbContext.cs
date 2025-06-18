using ProjectSelene.Domain.Entities;

namespace ProjectSelene.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Mod> Mods { get; }
    DbSet<ModVersion> ModVersions { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
