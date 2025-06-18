namespace ProjectSelene.Domain.Entities;

public class Mod : BaseAuditableEntity
{
    public required Guid Guid { get; init; }

    public required ModInfo Info { get; set; }
    public int InfoId { get; set; }

    public ModVersion? LatestVersion { get; set; }
    public int? LatestVersionId { get; set; }
    public List<ModVersion> Versions { get; set; } = [];

    public class Configuration : BaseConfiguration<Mod>, IEntityTypeConfiguration<Mod>
    {
        public override void Configure(EntityTypeBuilder<Mod> builder)
        {
            base.Configure(builder);

            builder.HasIndex(m => m.Guid, "IX_Mods_Guid")
                .IsUnique();

            builder.HasOne(m => m.Info)
                .WithOne()
                .HasForeignKey<Mod>(m => m.InfoId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(m => m.LatestVersion)
                .WithMany()
                .HasForeignKey(m => m.LatestVersionId)
                .IsRequired(false);

            //builder.HasMany(m => m.Versions)
            //    .WithOne(v => v.Mod)
            //    .HasForeignKey(v => v.ModId)
            //    .IsRequired();
        }
    }
}
