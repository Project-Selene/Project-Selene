namespace ProjectSelene.Domain.Entities;

public class ModInfo : BaseAuditableEntity
{
    public required string Name { get; set; }
    public required string Description { get; set; }

    public class Configuration : BaseConfiguration<ModInfo>, IEntityTypeConfiguration<ModInfo>
    {
        public override void Configure(EntityTypeBuilder<ModInfo> builder)
        {
            base.Configure(builder);

            builder.Property(m => m.Name)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(m => m.Description)
                   .IsRequired()
                   .HasMaxLength(10000);
        }
    }
}
