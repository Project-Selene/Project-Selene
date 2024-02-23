using AutoMapper;
using ProjectSelene.Models;

namespace ProjectSelene.DTOs.AutoMapper;

public class UserProfile : Profile
{
    public UserProfile()
    {
        CreateMap<User, UserInfo>()
            .ForMember(dst => dst.LoginType, opt => opt.MapFrom(src => src.GithubId != 0 ? LoginType.Github : LoginType.Discord));
    }
}
