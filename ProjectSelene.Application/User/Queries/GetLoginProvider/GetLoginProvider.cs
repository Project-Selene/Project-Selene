using Microsoft.AspNetCore.Identity;
using ProjectSelene.Domain.Entities;

namespace ProjectSelene.Application.User.Queries.GetLoginProvider;

public record GetLoginProviderQuery : IRequest<List<LoginProviderDTO>>
{
}


public class GetLoginProviderQueryHandler(SignInManager<SeleneUser> signInManager) : IRequestHandler<GetLoginProviderQuery, List<LoginProviderDTO>>
{
    public async Task<List<LoginProviderDTO>> Handle(GetLoginProviderQuery request, CancellationToken cancellationToken)
    {
        var schemes = await signInManager.GetExternalAuthenticationSchemesAsync();
        return schemes
            .Select(src => new LoginProviderDTO()
            {
                Url = "/login/" + src.Name,
                Type = src.Name,
            })
            .ToList();
    }
}
