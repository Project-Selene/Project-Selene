using Microsoft.Extensions.Logging;
using ProjectSelene.Domain.Events;

namespace ProjectSelene.Application.Mods.EventHandlers;

public class VersionVerifiedEventHandler(
    IApplicationDbContext context,
    ILogger<VersionVerifiedEventHandler> logger,
    IUser user,
    IAdminNotifier adminNotifier
    ) : INotificationHandler<VersionVerifiedEvent>
{
    public async ValueTask Handle(VersionVerifiedEvent notification, CancellationToken cancellationToken)
    {
        if (notification.Verified == VersionVerifiedEvent.VerificationStatus.Verified)
        {
            var version = await context.ModVersions
                .Include(v => v.CreatedBy)
                .Include(v => v.ChangeRequests)
                .ThenInclude(cr => cr.ModInfo)
                .Include(v => v.Mod.Info)
                .FirstOrDefaultAsync(v => v.Id == notification.VersionId, cancellationToken);
            if (version == null)
            {
                logger.LogWarning("Version {VersionId} not found for verification", notification.VersionId);
                //TODO: Notify admins
                return;
            }

            version.VerifiedById = user.Id;
            version.VerifiedOn = DateTime.UtcNow;
            version.Mod.LatestVersionId = notification.VersionId;

            if (version.ChangeRequests.Count > 0)
            {
                version.Mod.Info = version.ChangeRequests[0].ModInfo;

                context.ModInfoChangeRequest.RemoveRange(version.ChangeRequests);
            }

            await context.SaveChangesAsync(cancellationToken);

            await adminNotifier.NotifyVersionVerified(notification.MessageId, version.Mod.Info.Name, version.Mod.Info.Description, version.Version, version.CreatedBy?.UserName ?? "Unknown", "", cancellationToken);
        }
        else if (notification.Verified == VersionVerifiedEvent.VerificationStatus.Rejected)
        {
            logger.LogWarning("Rejected version {VersionId}", notification.VersionId);
            //TODO: Implement
        }
        else
        {
            throw new InvalidOperationException($"Unknown verification status: {notification.Verified}");
        }
    }
}
