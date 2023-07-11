using System.Text.Json.Serialization;

namespace ProjectSelene.Models;

public class Artifact
{
    [Key]
    public int Id { get; init; }

    [Required]
    public string Url { get; init; } = "";

    [JsonIgnore]
    public StoredObject? StoredObject { get; init; }

    [JsonIgnore]
    public ModVersion ModVersion { get; init; } = new();
}
