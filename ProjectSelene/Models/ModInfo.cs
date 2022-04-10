namespace ProjectSelene.Models;

public class ModInfo
{
    [Required]
    [MinLength(1)]
    public string Name { get; set; } = "";

    [Required]
    public string Description { get; set; } = "";
}
