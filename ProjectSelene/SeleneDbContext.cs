using Microsoft.EntityFrameworkCore;
using ProjectSelene.Models;

namespace ProjectSelene;

public class SeleneDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Mod> Mods => Set<Mod>();

    public SeleneDbContext(DbContextOptions options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Mod>()
                .OwnsOne(m => m.Info);

        modelBuilder.Entity<Mod>()
                .OwnsMany(m => m.Versions, v =>
                {
                    v.OwnsMany(v => v.Artifacts);
                });
    }
}
