using Microsoft.AspNetCore.Http.HttpResults;
using ProjectSelene.Application.Mods.Commands.RegisterVersion;
using ProjectSelene.Application.Mods.Commands.SubmitVersion;
using ProjectSelene.Application.Mods.Queries.ListMods;

namespace ProjectSelene.Web.Endpoints;

public class Mods : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapGet(GetMods);

        app.MapGroup(this)
            .RequireAuthorization()
            .MapPost(RegisterVersion, "RegisterVersion/{id}")
            .MapPost(SubmitVersion, "SubmitVersion/{id}");
    }

    public async Task<ModListDto> GetMods(ISender sender, CancellationToken cancellationToken)
    {
        return await sender.Send(new ListModsQuery(), cancellationToken);
    }

    public async Task<Results<NoContent, BadRequest>> RegisterVersion(ISender sender, Guid id, RegisterVersionCommand command, CancellationToken cancellationToken)
    {
        if (id != command.ModId)
        {
            return TypedResults.BadRequest();
        }

        await sender.Send(command, cancellationToken);

        return TypedResults.NoContent();
    }

    public async Task<Results<NoContent, BadRequest>> SubmitVersion(ISender sender, Guid id, SubmitVersionCommand command, CancellationToken cancellationToken)
    {
        if (id != command.ModId)
        {
            return TypedResults.BadRequest();
        }

        await sender.Send(command, cancellationToken);

        return TypedResults.NoContent();
    }
}
