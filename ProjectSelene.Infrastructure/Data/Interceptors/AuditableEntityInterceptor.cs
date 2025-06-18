using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using ProjectSelene.Application.Common.Interfaces;
using ProjectSelene.Domain.Common;

namespace ProjectSelene.Infrastructure.Data.Interceptors;

public class AuditableEntityInterceptor(
    IUser user,
    TimeProvider dateTime) : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        UpdateEntities(eventData.Context);

        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        UpdateEntities(eventData.Context);

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public void UpdateEntities(DbContext? context)
    {
        if (context == null)
        {
            return;
        }

        foreach (var entry in context.ChangeTracker.Entries<BaseAuditableEntity>())
        {
            if (entry.State is EntityState.Added or EntityState.Modified || entry.HasChangedOwnedEntities())
            {
                var utcNow = dateTime.GetUtcNow();
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedById = user.Id;
                    entry.Entity.Created = utcNow;
                }
                entry.Entity.LastModifiedById = user.Id;
                entry.Entity.LastModified = utcNow;
            }
        }
    }
}

public static class Extensions
{
    public static bool HasChangedOwnedEntities(this EntityEntry entry) =>
        entry.References.Any(r =>
            r.TargetEntry != null &&
            r.TargetEntry.Metadata.IsOwned() &&
            (r.TargetEntry.State == EntityState.Added || r.TargetEntry.State == EntityState.Modified));
}
