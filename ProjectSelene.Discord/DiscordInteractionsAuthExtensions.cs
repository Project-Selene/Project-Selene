using Microsoft.AspNetCore.Authentication;

namespace ProjectSelene.Discord;

public static class DiscordInteractionsAuthExtensions
{
    public static AuthenticationBuilder AddDiscordInteractions(this AuthenticationBuilder builder)
        => builder.AddDiscordInteractions(DiscordInteractionsAuthDefaults.AuthenticationScheme);

    public static AuthenticationBuilder AddDiscordInteractions(this AuthenticationBuilder builder, string authenticationScheme)
        => builder.AddDiscordInteractions(authenticationScheme, _ => { });

    public static AuthenticationBuilder AddDiscordInteractions(this AuthenticationBuilder builder, Action<DiscordInteractionsAuthOptions> configure)
        => builder.AddDiscordInteractions(DiscordInteractionsAuthDefaults.AuthenticationScheme, configure);

    public static AuthenticationBuilder AddDiscordInteractions(this AuthenticationBuilder builder, string authenticationScheme, Action<DiscordInteractionsAuthOptions> configure)
    {
        ArgumentNullException.ThrowIfNull(builder);
        ArgumentNullException.ThrowIfNull(authenticationScheme);
        ArgumentNullException.ThrowIfNull(configure);

        builder = builder.AddScheme<DiscordInteractionsAuthOptions, DiscordInteractionsAuthHandler>(authenticationScheme, configure);

        return builder;
    }
}
