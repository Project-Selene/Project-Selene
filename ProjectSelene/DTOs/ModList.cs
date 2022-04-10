namespace ProjectSelene.DTOs;


public record ModList(IEnumerable<ModList.Entry> Entries)
{
    public record Entry(
        int Id,
        string Name,
        string Description,
        string Version
        );
}
