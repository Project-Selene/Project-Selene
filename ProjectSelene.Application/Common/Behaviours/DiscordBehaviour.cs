using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;
using System.Reflection;
using System.Text;

namespace ProjectSelene.Application.Common.Behaviours;

public record DiscordConfig
{
    public required string PublicKey { get; set; }
    public required string Algorithm { get; set; }
}

public class DiscordBehaviour<TRequest, TResponse>(HttpContextAccessor httpContextAccessor, ILogger<DiscordBehaviour<TRequest, TResponse>> logger, IOptions<DiscordConfig> config) : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var discordAttributes = request.GetType().GetCustomAttributes<DiscordAttribute>();

        if (discordAttributes.Any())
        {
            var httpRequest = httpContextAccessor.HttpContext.Request;

            var publicKey = Convert.FromHexString(config.Value.PublicKey);

            var timeStamp = Encoding.ASCII.GetBytes(httpRequest.Headers["X-Signature-Timestamp"].ToString().Trim());
            var signature = Convert.FromHexString(httpRequest.Headers["X-Signature-Ed25519"].ToString().Trim());

            using var ms = new MemoryStream();

            var position = httpRequest.Body.Position;
            httpRequest.Body.Position = 0;
            await httpRequest.Body.CopyToAsync(ms, cancellationToken);
            httpRequest.Body.Position = position;

            var signer = SignerUtilities.GetSigner(config.Value.Algorithm);
            signer.Init(false, new Ed25519PublicKeyParameters(publicKey));
            signer.BlockUpdate(timeStamp);
            signer.BlockUpdate(ms.ToArray());
            var valid = signer.VerifySignature(signature);

            logger.LogInformation("Signature verification: {valid}", valid);

            if (!valid)
            {
                throw new UnauthorizedAccessException("Failed to validate Discord signature.");
            }
        }

        return await next();
    }
}
