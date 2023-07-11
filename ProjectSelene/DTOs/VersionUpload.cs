namespace ProjectSelene.DTOs;

public record VersionUpload(
    int ModId,
    [Required]
    [RegularExpression(@"^\d+\.\d+\.\d+$")]
    string Version,
    [Required]
    IEnumerable<string> Artifacts,
    [Required]
    IEnumerable<string> StoredObjects
    );