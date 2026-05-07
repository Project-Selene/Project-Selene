using ProjectSelene.Domain.Constants;
using System.Text.Json.Serialization;
using static ProjectSelene.Domain.Events.VersionVerifiedEvent;

namespace ProjectSelene.Domain.Events;

public record VersionVerifiedEvent(int VersionId, VerificationStatus Verified, DiscordEvents Type = DiscordEvents.VersionVerified) : BaseEvent
{
    [JsonIgnore]
    public ulong MessageId { get; set; }

    public enum VerificationStatus
    {
        Verified,
        Rejected
    }
}
