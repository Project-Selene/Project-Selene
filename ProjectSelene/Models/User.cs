using Microsoft.EntityFrameworkCore;

namespace ProjectSelene.Models;

[Index(nameof(GithubId))]
[Index(nameof(DiscordId))]
public class User
{
    [Key]
    public int Id { get; init; }
    public string Name { get; set; } = "";
    public string? AvatarUrl { get; set; }
    public int GithubId { get; set; }
    public ulong DiscordId { get; set; }

    public bool IsAdmin { get; set; } = false;

    public List<Mod> Mods { get; set; } = new List<Mod> { };

    public ICollection<Artifact> Artifacts { get; init; } = new List<Artifact>();
    public ICollection<ModVersionDraft> ModVersionDrafts { get; init; } = new List<ModVersionDraft>();
}