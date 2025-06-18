using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.MicrosoftAccount;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using ProjectSelene.Application.Common.Interfaces;
using ProjectSelene.Domain.Constants;
using ProjectSelene.Domain.Entities;
using ProjectSelene.Infrastructure.Data;
using ProjectSelene.Infrastructure.Data.Interceptors;
using ProjectSelene.Infrastructure.Identity;
using ProjectSelene.Infrastructure.Storage;
using System.Security.Claims;

namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static void AddInfrastructureServices(this IHostApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetConnectionString("SeleneSqliteDb");
        Guard.Against.Null(connectionString, message: "Connection string 'SeleneSqliteDb' not found.");

        builder.Services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();
        builder.Services.AddScoped<ISaveChangesInterceptor, DispatchDomainEventsInterceptor>();

        builder.Services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.AddInterceptors(sp.GetServices<ISaveChangesInterceptor>());
            options.UseSqlite(connectionString);
        });


        builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

        builder.Services.AddScoped<ApplicationDbContextInitialiser>();

        //builder.Services.AddScoped<IStorageProviderService, AWSStorageService>();
        //builder.Services.Configure<AWSStorageConfig>(builder.Configuration.GetSection("Storage"));
        builder.Services.AddScoped<IStorageProviderService, FSStorageService>();
        builder.Services.Configure<FSStorageConfig>(builder.Configuration.GetSection("Storage"));

        builder.Services.AddAuthentication("Cookie_Or_ApiKey")
            .AddApiKey(ApiKeyDefaults.AuthenticationScheme)
            .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddMicrosoftAccount(options =>
            {
                if (!builder.Configuration.GetSection("MicrosoftAccountOptions").Exists())
                {
                    options.ClientId = "invalid";
                    options.ClientSecret = "invalid";
                    options.TokenEndpoint = "invalid";
                    options.AuthorizationEndpoint = "invalid";
                    return;
                }

                options.ClientId = builder.Configuration["MicrosoftAccountOptions:ClientId"] ?? throw new InvalidOperationException("Missing MicrosoftAccountOptions:ClientId config");
                options.ClientSecret = builder.Configuration["MicrosoftAccountOptions:ClientSecret"] ?? throw new InvalidOperationException("Missing MicrosoftAccountOptions:ClientSecret config");
                options.UsePkce = true;
                options.TokenEndpoint = "https://login.microsoftonline.com/consumers/oauth2/v2.0/token";
                options.AuthorizationEndpoint = "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize";
                options.CallbackPath = $"/signin/{MicrosoftAccountDefaults.AuthenticationScheme}";
                options.Scope.Add("openid");
                options.Scope.Add("profile");
                options.Events.OnRemoteFailure += (RemoteFailureContext context) =>
                {
                    context.Response.Redirect("/login-failed");
                    context.HandleResponse();
                    return Task.CompletedTask;
                };
                options.Events.OnCreatingTicket += CreateUserForMicrosoftAccount;
            })
            .AddPolicyScheme("Cookie_Or_ApiKey", "Cookie_Or_ApiKey", options =>
            {
                options.ForwardDefaultSelector = context =>
                {
                    if (context.Request.Headers.ContainsKey("X-API-Key"))
                    {
                        return ApiKeyDefaults.AuthenticationScheme;
                    }

                    return CookieAuthenticationDefaults.AuthenticationScheme;
                };
            });

        builder.Services.AddAuthorizationBuilder();

        builder.Services
            .AddIdentityCore<SeleneUser>()
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddApiEndpoints();

        builder.Services.AddSingleton(TimeProvider.System);
        builder.Services.AddTransient<IIdentityService, IdentityService>();

        builder.Services.AddAuthorization(options => options.AddPolicy(Policies.CAN_PURGE, policy => policy.RequireRole(Roles.ADMINISTRATOR)));

        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.WithOrigins("http://localhost:8080")
                    .AllowCredentials()
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });

        builder.Services.AddAntiforgery();
    }

    public static IApplicationBuilder UseInfrastructure(this IApplicationBuilder app)
    {
        app.UseAuthentication();
        app.UseAuthorization();

        app.UseAntiforgery();
        app.UseCors();

        return app;
    }

    public static IEndpointRouteBuilder MapInfrastructure(this IEndpointRouteBuilder routeBuilder)
    {
        routeBuilder.Map("/login/{provider}", (HttpContext context, [FromServices] SignInManager<SeleneUser> signInManager, string provider) =>
        {
            var redirectUrl = UriHelper.BuildRelative(context.Request.PathBase, "/");
            var properties = signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
            return TypedResults.Challenge(properties, [provider]);
        });

        return routeBuilder;
    }


    private static async Task CreateUserForMicrosoftAccount(OAuthCreatingTicketContext context)
    {
        var principal = context.Principal;

        var key = principal?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (key == null)
        {
            context.Fail("No key found");
            return;
        }

        var userManager = context.HttpContext.RequestServices.GetRequiredService<UserManager<SeleneUser>>();
        var user = await userManager.FindByLoginAsync(MicrosoftAccountDefaults.AuthenticationScheme, key);
        if (user != null)
        {
            context.Identity?.TryRemoveClaim(context.Identity.FindFirst(c => c.Type == ClaimTypes.NameIdentifier));
            context.Identity?.AddClaim(new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()));
            return;
        }


        var signInManager = context.HttpContext.RequestServices.GetRequiredService<SignInManager<SeleneUser>>();
        var userName = Guid.NewGuid().ToString();
        var newUser = new SeleneUser()
        {
            UserName = userName,
            Email = context.Principal?.FindFirstValue(ClaimTypes.Email),
            EmailConfirmed = true,
            NormalizedEmail = context.Principal?.FindFirstValue(ClaimTypes.Email)?.ToUpper(),
            NormalizedUserName = userName.ToUpper(),
        };
        var identityResult = await userManager.CreateAsync(newUser);
        if (!identityResult.Succeeded)
        {
            context.Fail(string.Join("\n", identityResult.Errors));
            return;
        }
        identityResult = await userManager.AddLoginAsync(newUser, new UserLoginInfo(MicrosoftAccountDefaults.AuthenticationScheme, key, "Microsoft"));
        if (!identityResult.Succeeded)
        {
            context.Fail(string.Join("\n", identityResult.Errors));
            return;
        }
        context.Identity?.TryRemoveClaim(context.Identity.FindFirst(c => c.Type == ClaimTypes.NameIdentifier));
        context.Identity?.AddClaim(new Claim(ClaimTypes.NameIdentifier, newUser.Id.ToString()));
    }
}
