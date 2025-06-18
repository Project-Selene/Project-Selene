namespace ProjectSelene.Domain.Common;

public abstract class BaseAuditableReadonlyEntity : BaseEntity
{
    public DateTimeOffset Created { get; set; }

    public SeleneUser? CreatedBy { get; set; }
    public string? CreatedById { get; set; }


    public class BaseReadonlyConfiguration<T> : IEntityTypeConfiguration<T>
        where T : BaseAuditableReadonlyEntity
    {
        public virtual void Configure(EntityTypeBuilder<T> builder)
        {
            builder.HasOne(e => e.CreatedBy)
                .WithMany()
                .HasForeignKey(e => e.CreatedById)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
