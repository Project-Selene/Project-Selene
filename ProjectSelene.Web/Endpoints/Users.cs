using ProjectSelene.Application.User.Commnads.GenerateApiKey;
using ProjectSelene.Application.User.Queries.GetLoginProvider;

namespace ProjectSelene.Web.Endpoints;

public class Users : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapGet(GetLoginProviders);

        app.MapGroup(this)
            .RequireAuthorization()
            .MapPost("apiKey", GenerateApiKey);
    }
    public async Task<List<LoginProviderDTO>> GetLoginProviders(ISender sender, CancellationToken cancellationToken)
    {
        return await sender.Send(new GetLoginProviderQuery(), cancellationToken);
    }

    public async Task<string> GenerateApiKey(GenerateApiKeyCommand command, ISender sender, CancellationToken cancellationToken)
    {
        return await sender.Send(command, cancellationToken);
    }
}
