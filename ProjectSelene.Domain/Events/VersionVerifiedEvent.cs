using static ProjectSelene.Domain.Events.VersionVerifiedEvent;

namespace ProjectSelene.Domain.Events;

public record VersionVerifiedEvent(int VersionId, VerificationStatus Verified) : BaseEvent
{
    public enum VerificationStatus
    {
        Verified,
        Rejected
    }
}
