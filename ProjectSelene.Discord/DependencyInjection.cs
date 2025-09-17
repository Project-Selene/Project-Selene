using Discord.Rest;
using Discord.Webhook;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ProjectSelene.Application.Common.Interfaces;
using ProjectSelene.Discord;
using System.Net;

namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static IHostApplicationBuilder AddDiscordAdminNotifier(this IHostApplicationBuilder builder)
    {
        builder.Services.Configure<DiscordOptions>(builder.Configuration.GetSection(nameof(DiscordOptions)));

        builder.Services.AddHttpClient("Discord", (services, httpClient) =>
        {
            var discordOptions = services.GetRequiredService<IOptions<DiscordOptions>>().Value;
            httpClient.DefaultRequestHeaders.Add("accept-encoding", "gzip, deflate");
            httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bot", discordOptions.BotToken);
        }).ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler()
        {
            AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate,
            UseCookies = false,
        });

        builder.Services.AddSingleton<DiscordRestConfig>(services =>
        {
            var discordOptions = services.GetRequiredService<IOptions<DiscordOptions>>().Value;
            var logger = services.GetRequiredService<ILogger<DiscordRestConfig>>();
            var httpClientFactory = services.GetRequiredService<IHttpClientFactory>();

            return new()
            {
                RestClientProvider = url => ActivatorUtilities.CreateInstance<RestClient>(services, url, httpClientFactory.CreateClient("Discord")),
                UseSystemClock = true,
                DefaultRatelimitCallback = (info) =>
                {
                    logger.LogTrace("Discord API rate limit: {Endpoint} - {Remaining}", info.Endpoint, info.Remaining);
                    return Task.CompletedTask;
                },
            };
        });
        builder.Services.AddKeyedSingleton<DiscordWebhookClient>("SubmissionWebhook", (services, _) =>
        {
            var discordOptions = services.GetRequiredService<IOptions<DiscordOptions>>().Value;
            var discordRestOptions = services.GetRequiredService<DiscordRestConfig>();

            return new(discordOptions.SubmissionWebhookUrl, discordRestOptions);
        });

        builder.Services.AddSingleton<IAdminNotifier, AdminNotifier>();


        return builder;
    }
}
