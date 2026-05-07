using ProjectSelene.Domain.Events;

namespace ProjectSelene.Application.Storage.EventHandlers;

public class ArtifactDownloadEventHandler : INotificationHandler<ArtifactDownloadEvent>
{
    public ValueTask Handle(ArtifactDownloadEvent notification, CancellationToken cancellationToken)
    {
        //TODO: Track statistics
        return ValueTask.CompletedTask;
    }
}
