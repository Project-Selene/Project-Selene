using Microsoft.Extensions.Logging;
using ProjectSelene.Domain.Events;

namespace ProjectSelene.Application.Mods.EventHandlers;

public class VersionSubmittedEventHandler(ILogger<VersionSubmittedEventHandler> logger) : INotificationHandler<VersionSubmittedEvent>
{
    public Task Handle(VersionSubmittedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("ProjectSelene Domain Event: {DomainEvent}", notification.GetType().Name);

        return Task.CompletedTask;
    }
}
