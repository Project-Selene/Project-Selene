namespace ProjectSelene.Models;

public class User
{
    [Key]
    public int Id { get; init; }

    public int GithubId { get; set; }

    public bool IsAdmin { get; set; } = false;

    public IEnumerable<Mod> Mods { get; set; } = Enumerable.Empty<Mod>();
}