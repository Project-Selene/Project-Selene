using AutoMapper;
using ProjectSelene.Models;

namespace ProjectSelene.DTOs.AutoMapper;

public class ArtifactProfile : Profile
{
    public ArtifactProfile()
    {
        CreateMap<Artifact, UnverifiedArtifact>()
            .ForMember(dst => dst.Versions, opt => opt.MapFrom(src => src.ModVersionDrafts));
        CreateMap<ModVersionDraft, UnverifiedArtifactVersion>()
            .ForMember(dst => dst.Mod, opt => opt.MapFrom(src => src.Mod.Guid));
    }
}
