namespace ProjectSelene.Models;

public class ModVersion
{
    [Key]
    public int Id { get; init; }

    [Required]
    [RegularExpression(@"^\d+\.\d+\.\d+$")]
    public string Version { get; set; } = "0.0.0";

    [Required]
    public User SubmittedBy { get; init; } = new User();

    [Required]
    public DateTime SubmittedOn { get; init; }

    [Required]
    public User VerifiedBy { get; set; } = new User();

    [Required]
    public DateTime VerifiedOn { get; init; }

    [Required]
    public Artifact Download { get; init; } = new Artifact();


    [InverseProperty(nameof(Models.Mod.Versions))]
    public Mod Mod { get; init; } = new Mod();
}
