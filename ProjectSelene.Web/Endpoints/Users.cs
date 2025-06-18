using Microsoft.AspNetCore.Mvc;
using ProjectSelene.Application.Common.Interfaces;
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
            .MapGet("demoToken", GenerateDemoToken);
    }
    public async Task<List<LoginProviderDTO>> GetLoginProviders(ISender sender, CancellationToken cancellationToken)
    {
        return await sender.Send(new GetLoginProviderQuery(), cancellationToken);
    }

    public async Task<string> GenerateDemoToken([FromServices] IApiKeyGenerator apiKeyGenerator, CancellationToken cancellationToken)
    {
        var token = await apiKeyGenerator.GenerateApiKey(30);
        return token;
    }
}
