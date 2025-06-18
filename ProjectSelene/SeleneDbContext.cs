using ProjectSelene.Models;

namespace ProjectSelene;

public class SeleneDbContext(DbContextOptions options) : DbContext(options), DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Mod> Mods => Set<Mod>();
    public DbSet<ModVersion> ModVersions => Set<ModVersion>();
    public DbSet<ModVersionDraft> ModVersionDrafts => Set<ModVersionDraft>();
    public DbSet<Artifact> Artifacts => Set<Artifact>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Mod>()
            .HasOne(m => m.Info)
            .WithOne()
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Mod>()
            .HasMany(m => m.Versions)
            .WithOne(v => v.Mod)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Mod>()
            .HasAlternateKey(m => m.Guid);

        modelBuilder.Entity<Artifact>()
            .HasMany(a => a.ModVersions)
            .WithOne(m => m.Download)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Artifact>()
            .HasMany(a => a.ModVersionDrafts)
            .WithOne(m => m.Download)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
