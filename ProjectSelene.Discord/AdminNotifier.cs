using Discord;
using Discord.Webhook;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using ProjectSelene.Application.Common.Interfaces;
using ProjectSelene.Domain.Events;
using System.Text.Json;

namespace ProjectSelene.Discord;

public class AdminNotifier([FromKeyedServices("SubmissionWebhook")] DiscordWebhookClient submissionWebhook, IOptions<DiscordOptions> options) : IAdminNotifier
{
    public async Task NotifyVersionSubmitted(int modVersionId, string modName, string description, string version, string author, bool hasUploadedVerifiedBefore, string? iconUrl, CancellationToken cancellationToken)
    {
        await submissionWebhook.SendMessageAsync(
            username: options.Value.SubmissionWebhookUserName,
            avatarUrl: options.Value.SubmissionWebhookAvatar,
            allowedMentions: new() { AllowedTypes = AllowedMentionTypes.None },
            components: new ComponentBuilderV2()
                .WithContainer(
                    new ContainerBuilder()
                        .WithTextDisplay("# " + modName + " - " + version + "\n" + description)
                )
                .WithTextDisplay("Submitted by: " + author + "\n" +
                    (hasUploadedVerifiedBefore
                        ? "This author has uploaded a version before."
                        : "This is the first time this author uploads this mod."))
                .WithActionRow(
                    new ActionRowBuilder()
                        .WithButton("Verify", JsonSerializer.Serialize(new VersionVerifiedEvent(modVersionId, VersionVerifiedEvent.VerificationStatus.Verified)), ButtonStyle.Primary)
                        .WithButton("Reject", JsonSerializer.Serialize(new VersionVerifiedEvent(modVersionId, VersionVerifiedEvent.VerificationStatus.Rejected)), ButtonStyle.Danger)
                )
                .Build(),
            options: new() { CancelToken = cancellationToken },
            flags: MessageFlags.ComponentsV2);
    }
    public async Task NotifyVersionVerified(ulong messageId, string modName, string description, string version, string author, string verifiedBy, CancellationToken cancellationToken)
    {
        await submissionWebhook.ModifyMessageAsync(
            messageId,
            properties =>
            {
                properties.Components = new ComponentBuilderV2()
                    .WithContainer(
                        new ContainerBuilder()
                            .WithTextDisplay("# " + modName + " - " + version + "\n" + description)
                    )
                    .WithTextDisplay("Submitted by: " + author + "\nVerified by: " + verifiedBy)
                    .Build();
            }, new() { CancelToken = cancellationToken });
    }
}
