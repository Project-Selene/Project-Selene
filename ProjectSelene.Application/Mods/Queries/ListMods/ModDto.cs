using ProjectSelene.Domain.Entities;

namespace ProjectSelene.Application.Mods.Queries.ListMods;

public class ModDto
{
    public required Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required string Author { get; set; }
    public required string Version { get; set; }
    public required IEnumerable<string> Versions { get; set; }


    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Mod, ModDto>()
                .ForMember(dst => dst.Id, opt => opt.MapFrom(src => src.Guid))
                .ForMember(dst => dst.Name, opt => opt.MapFrom(src => src.Info.Name))
                .ForMember(dst => dst.Description, opt => opt.MapFrom(src => src.Info.Description))
                .ForMember(dst => dst.Author, opt => opt.MapFrom(src => src.CreatedBy != null ? src.CreatedBy.UserName : "Unknown User"))
                .ForMember(dst => dst.Version, opt => opt.MapFrom(src => src.LatestVersion != null ? src.LatestVersion.Version : "?.?.?"))
                .ForMember(dst => dst.Versions, opt => opt.MapFrom(src => src.Versions.Select(v => v.Version)))
                ;
        }
    }
}
