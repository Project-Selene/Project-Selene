namespace ProjectSelene.Models;

public class Artifact
{
    [Key]
    public int Id { get; init; }

    [Required]
    public string Url { get; set; } = "";
}
