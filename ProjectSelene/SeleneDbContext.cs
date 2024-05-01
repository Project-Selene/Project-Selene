using Microsoft.EntityFrameworkCore;
using ProjectSelene.Models;

namespace ProjectSelene;

public class SeleneDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Mod> Mods => Set<Mod>();
    public DbSet<ModVersion> ModVersion => Set<ModVersion>();
    public DbSet<StoredObject> StoredObjects => Set<StoredObject>();

    public SeleneDbContext(DbContextOptions options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Mod>()
            .HasOne(m => m.Info)
            .WithOne()
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Mod>()
            .HasMany(m => m.Versions)
            .WithOne(v => v.OwnedBy)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Mod>()
            .HasAlternateKey(m => m.Guid);

        modelBuilder.Entity<Artifact>()
            .HasMany(a => a.ModVersions)
            .WithOne(m => m.Download)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Artifact>()
            .HasOne(a => a.StoredObject)
            .WithMany(o => o.Artifacts)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
