namespace ProjectSelene.Models;

public class Mod
{
    [Key]
    public int Id { get; init; }
    public Guid Guid { get; init; } = Guid.NewGuid();

    [Required]
    public User Author { get; set; } = new User();

    [Required]
    public ModInfo Info { get; set; } = new ModInfo();
    public int ModInfoId { get; set; }

    [Required]
    public List<ModVersion> Versions { get; set; } = [];
    [Required]
    public List<ModVersionDraft> VersionDrafts { get; set; } = [];
}
