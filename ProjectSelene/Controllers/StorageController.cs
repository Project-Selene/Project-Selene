using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ProjectSelene.Attributes;
using ProjectSelene.Models;
using ProjectSelene.Services;
using System.Net.Mime;

namespace ProjectSelene.Controllers;

[Route("storage")]
public class StorageController : Controller
{
    private readonly IStorageProviderService storageProvider;
    private readonly SeleneDbContext context;
    private readonly LoginService loginService;
    private readonly ILogger<StorageController> logger;

    public StorageController(IStorageProviderService storageProvider, SeleneDbContext context, LoginService loginService, ILogger<StorageController> logger)
    {
        this.storageProvider = storageProvider;
        this.context = context;
        this.loginService = loginService;
        this.logger = logger;
    }

    [HttpPost("upload")]
    [DisableFormValueModelBinding]
    public async Task<ActionResult<Artifact>> Upload(CancellationToken cancellationToken)
    {
        if (!this.loginService.IsLoggedIn(HttpContext))
        {
            return Forbid();
        }

        var user = await this.loginService.GetUser(HttpContext);
        if (user == null)
        {
            return BadRequest();
        }

        var unverifiedArtifactsCount = user.StoredObjects.Count(o => o.Artifacts.All(a => a.ModVersion.VerifiedBy == null));
        if (unverifiedArtifactsCount > 5)
        {
            this.logger.LogInformation("User {userId} tried to upload more objects than allowed.", user.Id);
            return Forbid();
        }

        MultipartReader reader = new(Request.GetMultipartBoundary(), Request.Body);
        reader.BodyLengthLimit = 50 * 1024 * 1024 / 8;
        var section = await reader.ReadNextSectionAsync(cancellationToken);
        if (section?.GetContentDispositionHeader() == null)
        {
            return BadRequest();
        }

        var stream = section.AsFileSection()?.FileStream;
        if (stream == null)
        {
            return BadRequest();
        }

        var id = await this.storageProvider.Upload(stream, cancellationToken);

        try
        {
            await context.StoredObjects.AddAsync(new()
            {
                Id = id,
                Owner = user,
                UploadedAt = DateTime.UtcNow,
            }, cancellationToken);

            await context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception)
        {
            await this.storageProvider.Delete(id, default);
            throw;
        }

        return Ok(new { id });
    }

    [HttpPost("delete/{id}")]
    public async Task<IActionResult> DeleteStorage([FromRoute] string id)
    {
        if (!this.loginService.IsLoggedIn(HttpContext))
        {
            return this.Forbid();
        }

        try
        {
            var user = await this.loginService.GetUser(HttpContext);
            if (user == null)
            {
                return this.Forbid();
            }

            var obj = await context.StoredObjects
                .Include(o => o.Artifacts)
                .FirstOrDefaultAsync(o => o.Id == id);
            if (obj == null)
            {
                return this.NotFound(new { id });
            }

            if (obj.Artifacts.Count > 0)
            {
                return this.BadRequest(new { error = "Object already connected to mod" });
            }

            await this.storageProvider.Delete(id);

            context.StoredObjects.Remove(obj);

            await this.context.SaveChangesAsync();
            return this.Ok(new { id });
        }
        catch
        {
            return this.BadRequest();
        }
    }

    [HttpGet("download/{id}")]
    public async Task<IActionResult> Download([FromRoute] string id, CancellationToken cancellationToken)
    {
        if (!Request.Host.Host.StartsWith("cdn."))
        {
            return this.BadRequest();
        }

        var obj = await context.StoredObjects
            .Where(o => o.Artifacts.Any(a => a.ModVersion.VerifiedBy != null))
            .FirstOrDefaultAsync(o => o.Id == id);

        if (obj != null)
        {
            Response.Headers.Add("Content-Disposition", new ContentDisposition() { FileName = "download", Inline = false }.ToString());

            var memoryStream = new MemoryStream();
            await this.storageProvider.Download(id, memoryStream, cancellationToken);
            memoryStream.Position = 0;
            return File(memoryStream, "text/plain");
        }


        if (!this.loginService.IsLoggedIn(HttpContext))
        {
            return this.NotFound(new { id });
        }

        try
        {
            var user = await this.loginService.GetUser(HttpContext);
            if (user == null)
            {
                return this.NotFound(new { id });
            }

            var obj2 = user.StoredObjects
                .FirstOrDefault(o => o.Id == id);
            if (obj2 == null)
            {
                return this.NotFound(new { id });
            }

            Response.Headers.Add("Content-Disposition", new ContentDisposition() { FileName = "download", Inline = false }.ToString());

            var memoryStream = new MemoryStream();
            await this.storageProvider.Download(id, memoryStream, cancellationToken);
            memoryStream.Position = 0;
            return File(memoryStream, "text/plain");
        }
        catch
        {
            return this.NotFound(new { id });
        }
    }
    [HttpGet("unverified")]
    public async Task<ActionResult<List<string>>> GetUnverified()
    {
        if (!this.loginService.IsLoggedIn(HttpContext))
        {
            return Forbid();
        }

        var user = await this.loginService.GetUser(HttpContext);
        if (user == null)
        {
            return BadRequest();
        }

        return user.StoredObjects.Where(o => o.Artifacts.All(a => a.ModVersion.VerifiedBy == null)).Select(o => o.Id).ToList();
    }
}
