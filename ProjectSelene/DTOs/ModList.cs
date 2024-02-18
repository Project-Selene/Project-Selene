namespace ProjectSelene.DTOs;

public class ModList
{
    public required IEnumerable<Entry> Entries { get; set; }
    public class Entry
    {
        public required Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }
        public required string Author { get; set; }
        public required string Version { get; set; }
        public required IEnumerable<string> Versions { get; set; }
    }
}
