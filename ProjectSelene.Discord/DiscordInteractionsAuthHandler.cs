using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;
using ProjectSelene.Application.Common.Behaviours;
using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;

namespace ProjectSelene.Discord;

public class DiscordInteractionsAuthHandler(IOptionsMonitor<DiscordInteractionsAuthOptions> options, ILoggerFactory logger, UrlEncoder encoder, IOptions<DiscordInteractionsConfig> config, IHttpContextAccessor httpContextAccessor)
    : AuthenticationHandler<DiscordInteractionsAuthOptions>(options, logger, encoder)
{
    private static readonly AuthenticateResult invalidSignature = AuthenticateResult.Fail("Failed to validate Discord signature.");
    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var httpRequest = httpContextAccessor.HttpContext?.Request ?? throw new Exception("Cannot use DiscordInteractionsAuthHandler withoout active http request");

        var publicKey = Convert.FromHexString(config.Value.PublicKey);

        var timeStamp = Encoding.ASCII.GetBytes(httpRequest.Headers["X-Signature-Timestamp"].ToString().Trim());
        var signature = Convert.FromHexString(httpRequest.Headers["X-Signature-Ed25519"].ToString().Trim());

        using var ms = new MemoryStream();

        httpRequest.EnableBuffering();

        var position = httpRequest.Body.Position;
        httpRequest.Body.Position = 0;
        await httpRequest.Body.CopyToAsync(ms, httpContextAccessor.HttpContext.RequestAborted);
        httpRequest.Body.Position = position;

        var signer = SignerUtilities.GetSigner(config.Value.Algorithm);
        signer.Init(false, new Ed25519PublicKeyParameters(publicKey));
        signer.BlockUpdate(timeStamp);
        signer.BlockUpdate(ms.ToArray());
        var valid = signer.VerifySignature(signature);

        Logger.LogTrace("Signature verification: {valid}", valid);

        if (!valid)
        {
            return invalidSignature;
        }

        var loginType = DiscordInteractionsAuthDefaults.AuthenticationScheme;
        var tokenPrincipal = new ClaimsPrincipal();
        //TODO: Maybe extract discord user id from request body
        tokenPrincipal.AddIdentity(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "Discord")], loginType));
        return AuthenticateResult.Success(new(tokenPrincipal, loginType));
    }
}
