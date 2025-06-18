
namespace ProjectSelene.Domain.Common;

public abstract class BaseAuditableEntity : BaseAuditableReadonlyEntity
{
    public DateTimeOffset LastModified { get; set; }

    public SeleneUser? LastModifiedBy { get; set; }
    public string? LastModifiedById { get; set; }


    public class BaseConfiguration<T> : BaseReadonlyConfiguration<T>, IEntityTypeConfiguration<T>
        where T : BaseAuditableEntity
    {
        public override void Configure(EntityTypeBuilder<T> builder)
        {
            base.Configure(builder);

            builder.HasOne(e => e.LastModifiedBy)
                .WithMany()
                .HasForeignKey(e => e.LastModifiedById)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
