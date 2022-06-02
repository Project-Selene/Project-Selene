namespace ProjectSelene.DTOs;

public record CreateMod(
    [Required] 
    string Name,
    [Required] 
    string Description,
    [Required]
    [RegularExpression(@"^\d+\.\d+\.\d+$")]
    string Version,
    [Required]
    [MinLength(1)]
    IEnumerable<string> Artifacts
);
