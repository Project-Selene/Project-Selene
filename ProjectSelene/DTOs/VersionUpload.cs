namespace ProjectSelene.DTOs;

public record VersionUpload(
    [Required]
    [RegularExpression(@"^\d+\.\d+\.\d+$")]
    string Version
    );
