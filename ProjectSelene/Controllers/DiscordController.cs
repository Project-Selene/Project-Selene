using Microsoft.AspNetCore.Mvc;
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
    public async Task<ActionResult<InteractionsResponse>> Interactions([FromBody] InteractionsRequest req)
    {
        logger.LogWarning("Discord request received: {request}", HttpContext.Request.Headers);

        try
        {
            var publicKey = Convert.FromHexString("fdca6a1ca0e2a44f7b131699bfbfaba5d225b9a1740a8b1eca3e894e5b2915fc");

            var timeStamp = Encoding.ASCII.GetBytes(HttpContext.Request.Headers["X-Signature-Timestamp"].ToString().Trim());
            var signature = Convert.FromHexString(HttpContext.Request.Headers["X-Signature-Ed25519"].ToString().Trim());

            using var ms = new MemoryStream();
            HttpContext.Request.Body.Position = 0;
            await HttpContext.Request.Body.CopyToAsync(ms);

            logger.LogWarning("Body {body}", Convert.ToBase64String(ms.ToArray()));

            var signer = SignerUtilities.GetSigner("Ed25519");
            signer.Init(false, new Ed25519PublicKeyParameters(publicKey));
            signer.BlockUpdate(timeStamp);
            signer.BlockUpdate(ms.ToArray());
            var valid = signer.VerifySignature(signature);

            logger.LogWarning("Signature verification: {valid}", valid);

            if (!valid)
            {
                return StatusCode(401, "invalid request signature");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to verify discord message");
        }

        if (req.Type == 1)
        {
            return new InteractionsResponse() { Type = 1 };
        }

        return new InteractionsResponse() { Type = 0 };
    }
}
