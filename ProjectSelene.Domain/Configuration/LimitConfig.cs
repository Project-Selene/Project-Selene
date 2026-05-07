namespace ProjectSelene.Domain.Configuration;

public class LimitConfig
{
    public int MaxVersions { get; init; } = 3;
    public int MaxModInfos { get; init; } = 3;
    public int MaxUploadSize { get; init; } = 10 * 1024 * 1024; // 10 MB
}
