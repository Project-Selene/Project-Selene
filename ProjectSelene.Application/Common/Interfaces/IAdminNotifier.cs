namespace ProjectSelene.Application.Common.Interfaces;

public interface IAdminNotifier
{
    Task NotifyVersionSubmitted(int modVersionId, string modName, string description, string version, string author, bool hasUploadedVerifiedBefore, string? iconUrl, CancellationToken cancellationToken = default);
    Task NotifyVersionVerified(ulong messageId, string modName, string description, string version, string author, string verifiedBy, CancellationToken cancellationToken = default);
}
