using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.DependencyInjection;
using ProjectSelene.Application.Common.Interfaces;

namespace ProjectSelene.Infrastructure.Identity;

internal static class ApiKeyExtensions
{
    public static AuthenticationBuilder AddApiKey(this AuthenticationBuilder builder)
        => builder.AddApiKey(ApiKeyDefaults.AuthenticationScheme);

    public static AuthenticationBuilder AddApiKey(this AuthenticationBuilder builder, string authenticationScheme)
        => builder.AddApiKey(authenticationScheme, _ => { });

    public static AuthenticationBuilder AddApiKey(this AuthenticationBuilder builder, Action<ApiKeyOptions> configure)
        => builder.AddApiKey(ApiKeyDefaults.AuthenticationScheme, configure);

    public static AuthenticationBuilder AddApiKey(this AuthenticationBuilder builder, string authenticationScheme, Action<ApiKeyOptions> configure)
    {
        ArgumentNullException.ThrowIfNull(builder);
        ArgumentNullException.ThrowIfNull(authenticationScheme);
        ArgumentNullException.ThrowIfNull(configure);

        builder = builder.AddScheme<ApiKeyOptions, ApiKeyHandler>(authenticationScheme, configure);

        builder.Services.AddTransient<IApiKeyGenerator, ApiKeyHandler>();

        return builder;
    }
}
