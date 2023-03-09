using ProjectSelene.Models;

namespace ProjectSelene.DTOs;

public record VersionDetails(
    string Version, 
    string SubmittedBy, 
    DateTime SubmittedOn, 
    bool Verified, 
    IEnumerable<Artifact> Artifacts
)
{
    public VersionDetails(ModVersion version)
        : this(version.Version, version.SubmittedBy.GithubId.ToString(), version.SubmittedOn, version.VerifiedBy != null, version.Artifacts)
    {

    }
}