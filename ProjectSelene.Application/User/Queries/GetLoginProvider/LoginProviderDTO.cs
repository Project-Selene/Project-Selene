using Microsoft.AspNetCore.Authentication;

namespace ProjectSelene.Application.User.Queries.GetLoginProvider;
public class LoginProviderDTO
{
    public required string Url { get; set; }
    public required string Type { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AuthenticationScheme, LoginProviderDTO>()
                .ForMember(dst => dst.Url, opt => opt.MapFrom(src => "/login/" + src.Name))
                .ForMember(dst => dst.Type, opt => opt.MapFrom(src => src.Name))
                ;
        }
    }
}
