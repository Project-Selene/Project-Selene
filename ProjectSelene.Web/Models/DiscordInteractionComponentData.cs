namespace ProjectSelene.Web.Models;

public record DiscordInteractionComponentData
{
    public required string CustomId { get; init; }
    public required int ComponentType { get; init; }
}
