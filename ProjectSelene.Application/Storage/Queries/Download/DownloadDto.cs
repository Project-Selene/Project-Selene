namespace ProjectSelene.Application.Storage.Queries.Download;

public record DownloadDto
{
    public required Stream Stream { get; init; }
    public required DateTimeOffset LastModified { get; init; }
}
