namespace ProjectSelene.Models;

public class Artifact
{
    [Key]
    public string Id { get; init; } = "";
    public User Owner { get; init; } = new User();
    public DateTime UploadedAt { get; init; }
    public ICollection<ModVersion> ModVersions { get; init; } = new List<ModVersion>();
    public ICollection<ModVersionDraft> ModVersionDrafts { get; init; } = new List<ModVersionDraft>();
}
