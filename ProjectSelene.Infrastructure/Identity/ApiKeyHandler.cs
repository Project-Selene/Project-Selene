using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ProjectSelene.Application.Common.Interfaces;
using ProjectSelene.Domain.Entities;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace ProjectSelene.Infrastructure.Identity;

internal class ApiKeyHandler(IOptionsMonitor<ApiKeyOptions> options, ILoggerFactory logger, UrlEncoder encoder, IDataProtectionProvider dp, UserManager<SeleneUser> userManager, IHttpContextAccessor httpContextAccessor)
    : AuthenticationHandler<ApiKeyOptions>(options, logger, encoder), IApiKeyGenerator
{
    private static readonly AuthenticateResult failedUnprotectingToken = AuthenticateResult.Fail("Unprotected token failed");
    private static readonly AuthenticateResult invalidToken = AuthenticateResult.Fail("Invalid token");
    private static readonly AuthenticateResult tokenExpired = AuthenticateResult.Fail("Token expired");

    private readonly TicketDataFormat protector = new(dp.CreateProtector("ProjectSelene.Infrastructure.Identity.ApiKey"));

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("X-API-Key", out var token))
        {
            return AuthenticateResult.NoResult();
        }

        var ticket = protector.Unprotect(token);
        if (ticket?.Properties?.ExpiresUtc is not { } expiresUtc)
        {
            return failedUnprotectingToken;
        }

        if (TimeProvider.GetUtcNow() >= expiresUtc)
        {
            return tokenExpired;
        }

        var user = await userManager.GetUserAsync(ticket.Principal);
        if (user == null)
        {
            return invalidToken;
        }

        if (user.ApiKeyExpires != expiresUtc)
        {
            return tokenExpired;
        }

        return AuthenticateResult.Success(ticket);
    }

    public async Task<string> GenerateApiKey(int expiresInDays)
    {
        if (httpContextAccessor.HttpContext == null)
        {
            throw new InvalidOperationException("HttpContext is not available");
        }

        var user = await userManager.GetUserAsync(httpContextAccessor.HttpContext.User);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        var loginType = httpContextAccessor.HttpContext.User.Identity?.AuthenticationType ?? "";

        var tokenPrincipal = new ClaimsPrincipal();
        tokenPrincipal.AddIdentity(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, user.Id)], loginType));
        var ticket = new AuthenticationTicket(tokenPrincipal, loginType);
        ticket.Properties.ExpiresUtc = TimeProvider.GetUtcNow().AddDays(expiresInDays);

        var token = protector.Protect(ticket);
        user.ApiKeyExpires = ticket.Properties.ExpiresUtc;
        await userManager.UpdateAsync(user);

        return token;
    }
}
