namespace ProjectSelene.Models;

public class User
{
    [Key]
    public int Id { get; init; }

    public int GithubId { get; set; }

    public bool IsAdmin { get; set; } = false;

    public List<Mod> Mods { get; set; } = new List<Mod> { };

    public ICollection<StoredObject> StoredObjects { get; init; } = new List<StoredObject>();
}