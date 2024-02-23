namespace ProjectSelene.DTOs;

public class UserInfo
{
    public LoginType LoginType { get; set; }
    public string Name { get; set; } = "";
    public string? AvatarUrl { get; set; } = "";
}
