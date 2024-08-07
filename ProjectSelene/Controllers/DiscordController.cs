using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;
using ProjectSelene.DTOs;
using ProjectSelene.Models;
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

            logger.LogWarning("Timestamp {timestamp}", HttpContext.Request.Headers["X-Signature-Timestamp"].ToString());
            var signer = SignerUtilities.GetSigner("Ed25519");
            signer.Init(false, new Ed25519PublicKeyParameters(Convert.FromBase64String("fdca6a1ca0e2a44f7b131699bfbfaba5d225b9a1740a8b1eca3e894e5b2915fc")));
            signer.BlockUpdate(Encoding.ASCII.GetBytes(HttpContext.Request.Headers["X-Signature-Timestamp"].ToString()));
            signer.BlockUpdate(ms.ToArray());
            var valid = signer.VerifySignature(Encoding.ASCII.GetBytes(HttpContext.Request.Headers["X-Signature-Timestamp"].ToString()));

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


    private const int DRAFT_LIMIT = 5;

    [HttpGet("list")]
    public async Task<ModList> GetModList()
    {
        User? user = null;
        if (loginService.IsLoggedIn(this.HttpContext))
        {
            user = await loginService.GetUser(this.HttpContext);
        }

        return new ModList()
        {
            Entries = await context.Mods
                .Where(entry => entry.Author == user || entry.Versions.Count != 0 || entry.VersionDrafts.Any(d => d.CreatedBy == user))
                .ProjectTo<ModList.Entry>(mapper.ConfigurationProvider, new { user })
                .ToListAsync()
        };
    }

    [HttpPost("create")]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(string))]
    public async Task<ActionResult<IdResult>> CreateNewMod([FromBody] CreateMod data)
    {
        if (!loginService.IsLoggedIn(this.HttpContext))
        {
            return this.StatusCode(403);
        }

        if (!this.ModelState.IsValid)
        {
            return this.BadRequest();
        }

        try
        {
            var user = await loginService.GetUser(this.HttpContext);

            using var transaction = await context.Database.BeginTransactionAsync();

            if (await context.Mods.AnyAsync(m => m.Guid == data.Id))
            {
                return this.Conflict(data.Id);
            }
            if (await context.Mods.AnyAsync(m => m.Info.Name == data.Name))
            {
                return this.Conflict(data.Name);
            }

            var added = mapper.Map<Mod>(data);
            added.Author = user;
            user.Mods.Add(added);

            await context.SaveChangesAsync();

            await transaction.CommitAsync();

            return new IdResult(added.Guid);
        }
        catch
        {
            return this.BadRequest();
        }
    }

    [HttpPost("{id}/delete")]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(IdResult))]
    public async Task<ActionResult<IdResult>> DeleteMod([FromRoute] Guid id)
    {
        if (!loginService.IsLoggedIn(this.HttpContext))
        {
            return this.StatusCode(403);
        }

        try
        {
            var user = await loginService.GetUser(this.HttpContext);
            if (user == null)
            {
                return this.StatusCode(403);
            }

            var mod = !user.IsAdmin
                ? await context.Mods
                    .Include(m => m.Versions)
                    .FirstOrDefaultAsync(m => m.Guid == id && m.Author == user)
                : await context.Mods
                    .Include(m => m.Versions)
                    .FirstOrDefaultAsync(m => m.Guid == id);

            if (mod == null)
            {
                return this.NotFound(new IdResult(id));
            }

            if (user.IsAdmin)
            {
                context.Mods.Remove(mod);
            }
            else
            {
                foreach (var version in mod.Versions)
                {
                    if (version.SubmittedBy != user)
                    {
                        return this.StatusCode(403);
                    }
                }
                user.Mods.Remove(mod);
                context.Mods.Remove(mod);
            }

            await context.SaveChangesAsync();
            return this.Ok(new IdResult(id));
        }
        catch
        {
            return this.BadRequest();
        }
    }

    [HttpPost("{id}/{version}/delete")]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(VersionResult))]
    public async Task<ActionResult<VersionResult>> DeleteVersion([FromRoute] Guid id, [FromRoute] string version)
    {
        if (!loginService.IsLoggedIn(this.HttpContext))
        {
            return this.StatusCode(403);
        }

        try
        {
            var user = await loginService.GetUser(this.HttpContext);
            if (user == null)
            {
                return this.StatusCode(403);
            }

            var v = !user.IsAdmin
                ? await context.ModVersions
                    .Include(m => m.Mod)
                    .ThenInclude(v => v.Versions)
                    .FirstOrDefaultAsync(v => v.Mod.Guid == id && v.Version == version && v.SubmittedBy == user)
                : await context.ModVersions
                    .Include(m => m.Mod)
                    .ThenInclude(v => v.Versions)
                    .FirstOrDefaultAsync(v => v.Mod.Guid == id && v.Version == version);
            if (v == null)
            {
                return this.NotFound(new VersionResult(id, version));
            }

            if (v.Mod.Versions.Count == 1)
            {
                context.Mods.Remove(v.Mod);
                await context.SaveChangesAsync();
                return this.Ok(new { id });
            }
            else
            {
                v.Mod.Versions.Remove(v);
            }

            context.ModVersions.Remove(v);
            await context.SaveChangesAsync();
            return new VersionResult(id, version);
        }
        catch
        {
            return this.BadRequest();
        }
    }

    [HttpPost("draft/{id}/create")]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(int))]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
    [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(VersionResult))]
    public async Task<ActionResult<VersionResult>> UploadVersion([FromBody] VersionUpload versionUpload, [FromRoute] Guid id)
    {
        if (!loginService.IsLoggedIn(this.HttpContext))
        {
            return this.StatusCode(403);
        }

        if (!this.ModelState.IsValid)
        {
            return this.BadRequest();
        }

        try
        {
            var user = await loginService.GetUser(this.HttpContext);

            using var transaction = context.Database.BeginTransaction();

            var draftCount = await context.ModVersionDrafts
                .Where(v => v.CreatedBy == user)
                .CountAsync();

            if (draftCount >= DRAFT_LIMIT)
            {
                return this.BadRequest(new { error = "Too many draft versions." });
            }

            var mod = await context.Mods
                    .Include(m => m.VersionDrafts)
                    .FirstOrDefaultAsync(m => m.Guid == id);
            if (mod == null)
            {
                return this.NotFound(id);
            }

            if (mod.Versions.Any(v => v.Version == versionUpload.Version))
            {
                return this.Conflict(new { id, version = versionUpload.Version });
            }

            if (mod.VersionDrafts.Any(v => v.Version == versionUpload.Version))
            {
                return this.Conflict(new { id, version = versionUpload.Version });
            }

            mod.VersionDrafts.Add(new()
            {
                Version = versionUpload.Version,
                CreatedBy = user,
                CreatedOn = DateTime.Now,
                Mod = mod,
            });

            await context.SaveChangesAsync();

            await transaction.CommitAsync();
        }
        catch
        {
            return this.BadRequest();
        }

        return new VersionResult(id, versionUpload.Version);
    }

    [HttpPost("draft/{id}/{version}/delete")]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(VersionResult))]
    public async Task<ActionResult<VersionResult>> DeleteVersionDraft([FromRoute] Guid id, [FromRoute] string version)
    {
        if (!loginService.IsLoggedIn(this.HttpContext))
        {
            return this.StatusCode(403);
        }

        try
        {
            var user = await loginService.GetUser(this.HttpContext);
            if (user == null)
            {
                return this.StatusCode(403);
            }

            var v = !user.IsAdmin
                ? await context.ModVersionDrafts
                    .Include(m => m.Mod)
                    .ThenInclude(v => v.Versions)
                    .FirstOrDefaultAsync(v => v.Mod.Guid == id && v.Version == version && v.CreatedBy == user)
                : await context.ModVersionDrafts
                    .Include(m => m.Mod)
                    .ThenInclude(v => v.Versions)
                    .FirstOrDefaultAsync(v => v.Mod.Guid == id && v.Version == version);
            if (v == null)
            {
                return this.NotFound(new VersionResult(id, version));
            }

            v.Mod.VersionDrafts.Remove(v);
            context.ModVersionDrafts.Remove(v);
            await context.SaveChangesAsync();
            return new VersionResult(id, version);
        }
        catch
        {
            return this.BadRequest();
        }
    }

    [HttpPost("draft/{id}/{version}/submit")]
    public async Task<IActionResult> Submit([FromRoute] Guid id, [FromRoute] string version)
    {
        if (!loginService.IsLoggedIn(this.HttpContext))
        {
            return this.StatusCode(403);
        }

        try
        {
            var user = await loginService.GetUser(this.HttpContext);
            if (user == null)
            {
                return this.StatusCode(403);
            }

            var v = await context.ModVersionDrafts
                .Include(m => m.Download)
                .FirstOrDefaultAsync(v => v.Mod.Guid == id && v.Version == version && v.CreatedBy == user);
            if (v == null)
            {
                return this.NotFound(new VersionResult(id, version));
            }

            if (v.Download == null)
            {
                return this.ValidationProblem("Cannot submit version without download artifact");
            }

            v.SubmittedOn = DateTime.Now;

            //TODO: Send notification to admins

            await context.SaveChangesAsync();
            return this.Ok(new { id, version });
        }
        catch
        {
            return this.BadRequest();
        }
    }

    [HttpPost("draft/{id}/{version}/verify")]
    public async Task<IActionResult> Verify([FromRoute] Guid id, [FromRoute] string version)
    {
        if (!loginService.IsLoggedIn(this.HttpContext))
        {
            return this.StatusCode(403);
        }

        try
        {
            var user = await loginService.GetUser(this.HttpContext);
            if (user == null || !user.IsAdmin)
            {
                return this.StatusCode(403);
            }

            var v = await context.ModVersionDrafts
                    .Include(m => m.Mod)
                    .ThenInclude(v => v.Versions)
                    .Include(m => m.Mod)
                    .ThenInclude(v => v.VersionDrafts)
                    .Include(m => m.Download)
                    .Include(m => m.CreatedBy)
                    .FirstOrDefaultAsync(v => v.Mod.Guid == id && v.Version == version);
            if (v == null)
            {
                return this.NotFound(new VersionResult(id, version));
            }

            var newVersion = mapper.Map<ModVersion>(v);
            newVersion.VerifiedBy = user;

            v.Mod.Versions.Add(newVersion);
            v.Mod.VersionDrafts.Remove(v);
            context.ModVersionDrafts.Remove(v);

            await context.SaveChangesAsync();
            return this.Ok(new { id, version });
        }
        catch
        {
            return this.BadRequest();
        }
    }
}
