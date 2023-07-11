namespace ProjectSelene.Models;

public class ModInfo
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MinLength(1)]
    public string Name { get; set; } = "";

    [Required]
    public string Description { get; set; } = "";
}
