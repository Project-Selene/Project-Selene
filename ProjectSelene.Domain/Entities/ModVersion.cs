namespace ProjectSelene.Domain.Entities;

public class ModVersion : BaseAuditableEntity
{
    public string Version { get; init; } = "0.0.0";

    public SeleneUser? VerifiedBy { get; set; }
    public string? VerifiedById { get; set; }
    public DateTime? VerifiedOn { get; set; }
    public DateTime? SubmittedOn { get; set; }

    public Artifact? Download { get; set; }

    public required Mod Mod { get; init; }
    public int ModId { get; set; }

    public List<ModInfoChangeRequest> ChangeRequests { get; set; } = [];


    public class Configuration : BaseConfiguration<ModVersion>, IEntityTypeConfiguration<ModVersion>
    {
        public override void Configure(EntityTypeBuilder<ModVersion> builder)
        {
            base.Configure(builder);

            builder.Property(m => m.Version)
                .IsRequired()
                .HasMaxLength(16);

            builder.HasOne(m => m.VerifiedBy)
                .WithMany()
                .HasForeignKey(m => m.VerifiedById);

            builder.HasOne(m => m.Download)
                .WithMany(a => a.ModVersions)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(v => v.Mod)
                .WithMany(m => m.Versions)
                .HasPrincipalKey(m => m.Id)
                .HasForeignKey(v => v.ModId)
                .IsRequired();
        }
    }
}
