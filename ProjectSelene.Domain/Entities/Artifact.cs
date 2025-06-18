namespace ProjectSelene.Domain.Entities;

public class Artifact : BaseAuditableReadonlyEntity
{
    public required Guid Guid { get; init; }

    public ICollection<ModVersion> ModVersions { get; init; } = [];

    public class Configuration : BaseReadonlyConfiguration<Artifact>, IEntityTypeConfiguration<Artifact>
    {
        public override void Configure(EntityTypeBuilder<Artifact> builder)
        {
            base.Configure(builder);

            builder.HasIndex(m => m.Guid, "IX_Artifact_Guid")
                .IsUnique();

            builder.HasMany(m => m.ModVersions)
                .WithOne(v => v.Download)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
