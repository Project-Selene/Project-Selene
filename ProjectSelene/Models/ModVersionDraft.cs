namespace ProjectSelene.Models;

public class ModVersionDraft
{
    [Key]
    public int Id { get; init; }

    [Required]
    [RegularExpression(@"^\d+\.\d+\.\d+$")]
    public string Version { get; init; } = "0.0.0";

    [Required]
    public User CreatedBy { get; init; } = new User();

    [Required]
    public DateTime CreatedOn { get; init; }

    public Artifact? Download { get; set; }


    public DateTime? SubmittedOn { get; set; }


    [InverseProperty(nameof(Models.Mod.VersionDrafts))]
    public Mod Mod { get; init; } = new Mod();
}
