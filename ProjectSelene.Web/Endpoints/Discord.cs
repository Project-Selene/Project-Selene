using ProjectSelene.Application.Mods.Queries.ListMods;

namespace ProjectSelene.Web.Endpoints;

public class Discord : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapPost(Interactions);
    }

    public async Task<ModListDto> Interactions(ISender sender, CancellationToken cancellationToken)
    {
        return await sender.Send(new ListModsQuery(), cancellationToken);
    }
}
