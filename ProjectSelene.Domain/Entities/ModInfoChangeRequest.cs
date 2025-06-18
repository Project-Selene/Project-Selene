namespace ProjectSelene.Domain.Entities;

public class ModInfoChangeRequest : BaseAuditableEntity
{
    public required ModInfo ModInfo { get; set; }
    public ModVersion? ConnectedModVersion { get; set; }

    public class Configuration : BaseConfiguration<ModInfoChangeRequest>, IEntityTypeConfiguration<ModInfoChangeRequest>
    {
        public override void Configure(EntityTypeBuilder<ModInfoChangeRequest> builder)
        {
            base.Configure(builder);

            builder.HasOne(m => m.ModInfo)
                .WithMany()
                .IsRequired();

            builder.HasOne(m => m.ConnectedModVersion)
                .WithMany(v => v.ChangeRequests)
                .IsRequired(false);
        }
    }
}
