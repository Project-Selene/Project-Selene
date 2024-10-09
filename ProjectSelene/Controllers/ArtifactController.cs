using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using ProjectSelene.Attributes;
using ProjectSelene.DTOs;
using ProjectSelene.Services;
using System.Net.Mime;

namespace ProjectSelene.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArtifactController(IMapper mapper, IStorageProviderService storageProvider, SeleneDbContext context, LoginService loginService, ILogger<ArtifactController> logger, IConfiguration configuration) : ControllerBase
{
    private readonly string host = new Uri(configuration["Domains:CDN"] ?? "http://localhost/").Host;

    private const int UPLOAD_LIMIT = 50 * 1024 * 1024 / 8;

    [HttpPost("{mod}/{version}/upload")]
    [DisableFormValueModelBinding]
    public async Task<ActionResult> Upload(Guid mod, string version, CancellationToken cancellationToken)
    {
        if (!loginService.IsLoggedIn(HttpContext))
        {
            return Forbid();
        }

        var user = await loginService.GetUser(HttpContext);
        if (user == null)
        {
            return BadRequest();
        }

        var versionDraft = await context.ModVersionDrafts
            .Include(v => v.Download)
            .Include(v => v.CreatedBy)
            .FirstOrDefaultAsync(v => v.Mod.Guid == mod && v.Version == version && v.CreatedBy.Id == user.Id, cancellationToken);

        if (versionDraft == null)
        {
            logger.LogInformation("User {userId} tried to upload to a version that does not exist: {version} {mod}", user.Id, version, mod);
            return NotFound();
        }

        if (versionDraft.Download != null)
        {
            logger.LogInformation("User {userId} tried to upload to a version that already has an artifact: {version} {mod}", user.Id, version, mod);
            return Conflict();
        }

        MultipartReader reader = new(Request.GetMultipartBoundary(), Request.Body)
        {
            BodyLengthLimit = UPLOAD_LIMIT
        };
        var section = await reader.ReadNextSectionAsync(cancellationToken);
        if (section?.GetContentDispositionHeader() == null)
        {
            logger.LogWarning("User {userId} tried to upload an artifact without a content disposition header: {version} {mod}", user.Id, version, mod);
            return BadRequest();
        }

        var stream = section.AsFileSection()?.FileStream;
        if (stream == null)
        {
            logger.LogWarning("User {userId} tried to upload an artifact without a file: {version} {mod}", user.Id, version, mod);
            return BadRequest();
        }

        var id = await storageProvider.Upload(stream, cancellationToken);

        try
        {
            versionDraft.Download = new()
            {
                Id = id,
                Owner = user,
                UploadedAt = DateTime.UtcNow,
            };

            await context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception e)
        {
            if (cancellationToken.IsCancellationRequested)
            {
                logger.LogWarning(e, "Failed to save artifact {id} to database: {version} {mod}", id, version, mod);
            }
            else
            {
                logger.LogError(e, "Failed to save artifact {id} to database: {version} {mod}", id, version, mod);
            }
            await storageProvider.Delete(id, default); //No cancellation token here, we're want to delete the file no matter what
            throw;
        }

        logger.LogInformation("User {userId} uploaded artifact {id} to version {version} {mod}", user.Id, id, version, mod);
        return Ok(new { id });
    }

    [HttpPost("{mod}/{version}/delete")]
    public async Task<IActionResult> Delete(Guid mod, string version)
    {
        if (!loginService.IsLoggedIn(HttpContext))
        {
            return this.Forbid();
        }

        try
        {
            var user = await loginService.GetUser(HttpContext);
            if (user == null)
            {
                return this.Forbid();
            }

            var versionDraft = await context.ModVersionDrafts
                .Include(v => v.Download)
                .FirstOrDefaultAsync(v => v.Mod.Guid == mod && v.Version == version && v.CreatedBy.Id == user.Id);

            if (versionDraft == null)
            {
                logger.LogInformation("User {userId} tried to delete the artifact of a version that does not exist: {version} {mod}", user.Id, version, mod);
                return NotFound();
            }

            if (versionDraft.Download == null)
            {
                logger.LogInformation("User {userId} tried to delete the artifact that does not have an artifact: {version} {mod}", user.Id, version, mod);
                return NotFound();
            }

            var id = versionDraft.Download.Id;
            await storageProvider.Delete(id);

            context.Artifacts.Remove(versionDraft.Download);
            versionDraft.Download = null;

            await context.SaveChangesAsync();
            return this.Ok(new { id });
        }
        catch
        {
            return this.BadRequest();
        }
    }

    [HttpGet("{mod}/{version}")]
    public async Task<IActionResult> Download(Guid mod, string version, CancellationToken cancellationToken)
    {
        if (Request.Host.Host != this.host)
        {
            return this.BadRequest();
        }

        var id = await context.ModVersions
            .Where(v => v.Mod.Guid == mod && v.Version == version)
            .Select(v => v.Download.Id)
            .FirstOrDefaultAsync();

        if (id != null)
        {
            Response.Headers.Append("Content-Disposition", new ContentDisposition() { FileName = "download", Inline = false }.ToString());

            var mStream = new MemoryStream();
            await storageProvider.Download(id, mStream, cancellationToken);
            mStream.Position = 0;
            return File(mStream, "text/plain");
        }

        if (!loginService.IsLoggedIn(HttpContext))
        {
            return this.NotFound(new { id });
        }

        var user = await loginService.GetUser(HttpContext);
        if (user == null)
        {
            return BadRequest();
        }

        var draftId = await context.ModVersionDrafts
            .Where(v => v.Mod.Guid == mod && v.Version == version && v.CreatedBy.Id == user.Id && v.Download != null)
            .Select(v => v.Download!.Id)
            .FirstOrDefaultAsync(cancellationToken);
        if (draftId == null)
        {
            return this.NotFound(new { id });
        }

        Response.Headers.Append("Content-Disposition", new ContentDisposition() { FileName = "download", Inline = false }.ToString());

        var memoryStream = new MemoryStream();
        await storageProvider.Download(draftId, memoryStream, cancellationToken);
        memoryStream.Position = 0;
        return File(memoryStream, "text/plain");
    }

    [HttpGet("unverified")]
    public async Task<ActionResult<List<UnverifiedArtifact>>> GetUnverified()
    {
        if (!loginService.IsLoggedIn(HttpContext))
        {
            return Forbid();
        }

        var user = await loginService.GetUser(HttpContext);
        if (user == null)
        {
            return BadRequest();
        }

        return await context.Artifacts
            .Where(o => o.ModVersionDrafts.Any(v => v.CreatedBy.Id == user.Id))
            .ProjectTo<UnverifiedArtifact>(mapper.ConfigurationProvider)
            .ToListAsync();
    }
}
