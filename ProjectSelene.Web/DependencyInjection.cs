using Azure.Identity;
using Microsoft.AspNetCore.Mvc;
using NSwag;
using NSwag.Generation.Processors.Security;
using ProjectSelene.Application.Common.Interfaces;
using ProjectSelene.Infrastructure.Data;
using ProjectSelene.Web.Services;

namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static void AddWebServices(this IHostApplicationBuilder builder)
    {
        builder.Services.AddDatabaseDeveloperPageExceptionFilter();

        builder.Services.AddScoped<IUser, CurrentUser>();

        builder.Services.AddHttpContextAccessor();
        builder.Services.AddHealthChecks()
            .AddDbContextCheck<ApplicationDbContext>();

        builder.Services.AddExceptionHandler<CustomExceptionHandler>();

        // Customise default API behaviour
        builder.Services.Configure<ApiBehaviorOptions>(options =>
            options.SuppressModelStateInvalidFilter = true);

        builder.Services.AddEndpointsApiExplorer();

        builder.Services.AddOpenApiDocument((configure, sp) =>
        {
            configure.Title = "ProjectSelene API";

            // Add api key
            configure.AddSecurity("ApiKey", Enumerable.Empty<string>(), new OpenApiSecurityScheme
            {
                Type = OpenApiSecuritySchemeType.ApiKey,
                Name = "X-API-Key",
                In = OpenApiSecurityApiKeyLocation.Header,
                Description = "Enter you API key",
            });

            configure.OperationProcessors.Add(new AspNetCoreOperationSecurityScopeProcessor("ApiKey"));
        });
    }

    public static void AddKeyVaultIfConfigured(this IHostApplicationBuilder builder)
    {
        var keyVaultUri = builder.Configuration["AZURE_KEY_VAULT_ENDPOINT"];
        if (!string.IsNullOrWhiteSpace(keyVaultUri))
        {
            builder.Configuration.AddAzureKeyVault(
                new Uri(keyVaultUri),
                new DefaultAzureCredential());
        }
    }
}
