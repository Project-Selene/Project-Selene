using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using ProjectSelene.Application.Discord.Commands.Ping;
using ProjectSelene.Domain.Constants;
using ProjectSelene.Domain.Events;
using ProjectSelene.Web.Models;
using System.Text.Json;

namespace ProjectSelene.Web.Endpoints;

public class Discord : EndpointGroupBase
{
    private static readonly JsonSerializerOptions discordJsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
    };

    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization("Discord")
            .MapPost(Interactions);
    }

    public async Task<Results<Accepted, Ok<PingResultDto>, BadRequest>> Interactions([FromBody] DiscordInteractionBaseDto interactionData, IMediator sender, CancellationToken cancellationToken)
    {
        if (interactionData.Type == 1)
        {
            return TypedResults.Ok(await sender.Send(new PingCommand() { Id = interactionData.Id, Token = interactionData.Token }, cancellationToken));
        }

        if (interactionData.Type == 3)
        {
            if (interactionData.Data is null)
            {
                return TypedResults.BadRequest();
            }
            var raw = interactionData.Data.Deserialize<DiscordInteractionComponentData>(discordJsonOptions);
            if (raw is null)
            {
                return TypedResults.BadRequest();
            }

            var wrapper = JsonSerializer.Deserialize<ComponentTypeWrapper>(raw.CustomId);
            if (wrapper is null)
            {
                return TypedResults.BadRequest();
            }

            switch (wrapper.Type)
            {
                case DiscordEvents.VersionVerified:
                    var versionVerifiedData = JsonSerializer.Deserialize<VersionVerifiedEvent>(raw.CustomId);
                    if (versionVerifiedData is null)
                    {
                        return TypedResults.BadRequest();
                    }

                    if (interactionData.Message == null)
                    {
                        return TypedResults.BadRequest();
                    }

                    versionVerifiedData.MessageId = ulong.Parse(interactionData.Message?.Id ?? "0");
                    await sender.Publish(versionVerifiedData, CancellationToken.None);
                    break;
                default:
                    return TypedResults.BadRequest();
            }
        }


        return TypedResults.Accepted((string?)null);
    }
}

file record ComponentTypeWrapper
{
    public required DiscordEvents Type { get; init; }
}
