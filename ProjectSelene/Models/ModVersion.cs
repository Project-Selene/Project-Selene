using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectSelene.Models;

public class ModVersion
{
    [Key]
    public int Id { get; init; }

    [Required]
    [RegularExpression(@"^\d+\.\d+\.\d+$")]
    public string Version { get; set; } = "0.0.0";

    [Required]
    public User SubmittedBy { get; set; } = new User();

    [Required]
    public DateTime SubmittedOn { get; init; }

    public User? VerifiedBy { get; set; }

    [Required]
    [MinLength(1)]
    public Artifact[] Artifacts { get; set; } = Array.Empty<Artifact>();

    [InverseProperty(nameof(Mod.Versions))]
    public Mod OwnedBy { get; init; } = new Mod();
}
