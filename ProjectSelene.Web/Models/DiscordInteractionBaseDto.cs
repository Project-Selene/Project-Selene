namespace ProjectSelene.Web.Models;

public record DiscordInteractionBaseDto
{
    public required int Type { get; init; }
    public required string Id { get; init; }
    public required string Token { get; init; }
}
