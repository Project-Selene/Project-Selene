using ProjectSelene.Models;

namespace ProjectSelene.DTOs.AutoMapper;

public class ModProfile : Profile
{
#pragma warning disable IDE0009 // Member access should be qualified.
    public ModProfile()
    {
        User? user = null;
        CreateMap<Mod, ModList.Entry>()
            .IncludeMembers(m => m.Info)
            .ForMember(src => src.Author, opt => opt.MapFrom(m => m.Author.Name))
            .ForMember(src => src.Versions, opt => opt.MapFrom(m => m.Versions.Where(v => v.VerifiedBy != null || (user != null && v.SubmittedBy == user)).Select(v => v.Version)))
            .ForMember(src => src.Version, opt => opt.MapFrom(m => m.Versions.Where(v => v.VerifiedBy != null || (user != null && v.SubmittedBy == user)).Select(v => v.Version).Max()))
            .ForMember(src => src.Id, opt => opt.MapFrom(m => m.Guid));
        CreateMap<ModInfo, ModList.Entry>()
            .ForMember(src => src.Id, opt => opt.Ignore());

        CreateMap<ModVersionDraft, ModVersion>()
            .ForMember(src => src.Id, opt => opt.Ignore())
            .ForMember(src => src.SubmittedBy, opt => opt.MapFrom(d => d.CreatedBy))
            .ForMember(src => src.VerifiedOn, opt => opt.MapFrom(d => DateTime.Now));
    }
#pragma warning restore IDE0009 // Member access should be qualified.
}
