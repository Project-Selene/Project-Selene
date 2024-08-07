using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;
using ProjectSelene.Services;

namespace ProjectSelene.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DiscordController(ILogger<DiscordController> logger, IMapper mapper, SeleneDbContext context, LoginService loginService) : ControllerBase
{
    public class InteractionsRequest
    {
        public int Type { get; set; } = 0;
    }
    public class InteractionsResponse
    {
        public int Type { get; set; } = 0;
    }

    [HttpPost("interactions")]
    public async Task<InteractionsResponse> Interactions([FromBody] InteractionsRequest req)
    {
        logger.LogWarning("Discord request received: {request}", HttpContext.Request.Headers);

        try
        {

            using var ms = new MemoryStream();
            await HttpContext.Request.BodyReader.CopyToAsync(ms);

            logger.LogWarning("Body {body}", Convert.ToBase64String(ms.ToArray()));

            logger.LogWarning("Timestamp {timestamp}", HttpContext.Request.Headers["X-Signature-Timestamp"].ToString());
            var signer = SignerUtilities.GetSigner("Ed25519");
            signer.Init(false, new Ed25519PublicKeyParameters(Convert.FromBase64String("fdca6a1ca0e2a44f7b131699bfbfaba5d225b9a1740a8b1eca3e894e5b2915fc")));
            signer.BlockUpdate(Encoding.ASCII.GetBytes(HttpContext.Request.Headers["X-Signature-Timestamp"].ToString()));
            signer.BlockUpdate(ms.ToArray());
            var valid = signer.VerifySignature(Convert.FromBase64String(HttpContext.Request.Headers["X-Signature-Ed25519"].ToString()));

            logger.LogWarning("Signature verification: {valid}", valid);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to verify discord message");
        }

        if (req.Type == 1)
        {
            return new() { Type = 1 };
        }

        return new() { Type = 0 };
    }
}
