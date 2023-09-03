namespace ProjectSelene.DTOs;

public record CreateMod(
    [Required] 
    string Name,
    [Required] 
    string Description,
    [Required]
    [RegularExpression(@"^\d+\.\d+\.\d+$")]
    string Version
);
