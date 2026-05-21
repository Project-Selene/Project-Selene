using Microsoft.AspNetCore.Authentication;

namespace ProjectSelene.Discord;

public class DiscordInteractionsAuthOptions : AuthenticationSchemeOptions
{
    public Func<IServiceProvider, Task<string>>? GetOrCreateUser { get; set; }
}
