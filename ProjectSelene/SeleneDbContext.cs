using Microsoft.EntityFrameworkCore;
using ProjectSelene.Models;

namespace ProjectSelene;

public class SeleneDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();

    public IQueryable<Mod> Mods => Users.SelectMany(u => u.Mods);

    public SeleneDbContext(DbContextOptions options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .OwnsMany(m => m.Mods, m =>
            {
                m.OwnsOne(m => m.Info);
                m.OwnsMany(m => m.Versions, v =>
                {
                    v.OwnsMany(v => v.Artifacts);
                });
            });
    }
}
