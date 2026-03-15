using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using ProjectSelene.Application.Discord.Commands.Ping;
using ProjectSelene.Web.Models;

namespace ProjectSelene.Web.Endpoints;

public class Discord : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization("Discord")
            .MapPost(Interactions);
    }

    public async Task<Results<Accepted, Ok<PingResultDto>>> Interactions([FromBody] DiscordInteractionBaseDto interactionData, ISender sender, CancellationToken cancellationToken)
    {
        if (interactionData.Type == 1)
        {
            return TypedResults.Ok(await sender.Send(new PingCommand() { Id = interactionData.Id, Token = interactionData.Token }, cancellationToken));
        }


        return TypedResults.Accepted((string?)null);
    }
}
