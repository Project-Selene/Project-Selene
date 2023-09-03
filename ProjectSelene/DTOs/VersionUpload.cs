namespace ProjectSelene.DTOs;

public record VersionUpload(
    int ModId,
    [Required]
    [RegularExpression(@"^\d+\.\d+\.\d+$")]
    string Version,
    [Required]
    string StoredObject
    );