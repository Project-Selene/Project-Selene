namespace ProjectSelene.Domain.Events;

public record VersionSubmittedEvent(int ModVersionId) : BaseEvent;
