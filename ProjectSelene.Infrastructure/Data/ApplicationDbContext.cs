using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ProjectSelene.Application.Common.Interfaces;
using ProjectSelene.Domain.Common;
using ProjectSelene.Domain.Entities;

namespace ProjectSelene.Infrastructure.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : IdentityDbContext<SeleneUser>(options), IApplicationDbContext
{
    public DbSet<Mod> Mods => Set<Mod>();
    public DbSet<ModVersion> ModVersions => Set<ModVersion>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(BaseEntity).Assembly);
    }
}
