namespace ProjectSelene.Domain.Events;

public record ArtifactDownloadEvent(int ArtifactId) : BaseEvent;
