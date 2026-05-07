using System.Text.Json.Nodes;

namespace ProjectSelene.Web.Models;

public record DiscordInteractionBaseDto
{
    public required int Type { get; init; }
    public JsonObject? Data { get; init; }
    public required string Id { get; init; }
    public required string Token { get; init; }
    public PartialMessage? Message { get; init; }


    public record PartialMessage
    {
        public required string Id { get; init; }
    }
}
