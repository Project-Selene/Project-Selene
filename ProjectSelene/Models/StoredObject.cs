namespace ProjectSelene.Models;

public class StoredObject
{
    [Key]
    public string Id { get; init; } = "";
    public User Owner { get; init; } = new User();
    public DateTime UploadedAt { get; init; }
    public ICollection<Artifact> Artifacts { get; init; } = new List<Artifact>();
}
