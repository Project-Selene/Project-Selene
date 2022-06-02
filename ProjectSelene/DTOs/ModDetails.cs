using ProjectSelene.Models;

namespace ProjectSelene.DTOs;

public record ModDetails(
    string Name,
    string Description,
    string Author,
    IEnumerable<string> Versions
)
{
    public ModDetails(Mod mod, User? user)
        : this(mod.Info.Name, mod.Info.Description, mod.Author.GithubId.ToString(), mod.Versions
              .Where(v => v.VerifiedBy != null || (user != null && v.SubmittedBy == user))
              .Select(v => v.Version).ToArray())
    {
    }
}
