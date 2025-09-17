using ProjectSelene.Domain.Events;

namespace ProjectSelene.Application.Mods.EventHandlers;

public class VersionSubmittedEventHandler(IApplicationDbContext context, IAdminNotifier adminNotifier) : INotificationHandler<VersionSubmittedEvent>
{
    public async Task Handle(VersionSubmittedEvent notification, CancellationToken cancellationToken)
    {
        var data = await context.ModVersions
            .Where(v => v.Id == notification.ModVersionId)
            .Select(v => new
            {
                v.Version,
                ModInfo = v.ChangeRequests.Any() ? v.ChangeRequests.First().ModInfo : v.Mod.Info,
                Author = v.CreatedBy != null ? v.CreatedBy.UserName : null,
                HasBeenVerifiedBefore = v.Mod.Versions.Any(x => x.VerifiedOn != null && x.CreatedBy == v.CreatedBy)
            })
            .FirstAsync(cancellationToken);

        await adminNotifier.NotifyVersionSubmitted(notification.ModVersionId, data.ModInfo.Name, data.ModInfo.Description, data.Version, data.Author ?? "Deleted User", data.HasBeenVerifiedBefore, null, cancellationToken);
    }
}
