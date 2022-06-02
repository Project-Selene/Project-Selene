namespace ProjectSelene.Models;

public class Mod
{
    [Key]
    public int Id { get; init; }

    [Required]
    public User Author { get; set; } = new User();

    [Required]
    public ModInfo Info { get; set; } = new ModInfo();
    public int ModInfoId { get; set; }

    [Required]
    public List<ModVersion> Versions { get; set; } = new List<ModVersion>();

    public string? LatestVersionNumber { get; set; }
}
