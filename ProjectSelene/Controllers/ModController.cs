using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectSelene.DTOs;
using ProjectSelene.Models;
using ProjectSelene.Services;

namespace ProjectSelene.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ModController(IMapper mapper, SeleneDbContext context, LoginService loginService, IConfiguration configuration) : ControllerBase
{
    private readonly string cdn = configuration["Domains:CDN"] ?? "http://localhost";

    [HttpGet("list")]
    public async Task<ModList> GetModList()
    {
        if (loginService.IsLoggedIn(this.HttpContext))
        {
            var user = await loginService.GetUser(this.HttpContext);
            return new ModList()
            {
                Entries = await context.Mods
                    .Where(entry => entry.Author == user || entry.Versions.Any(v => v.VerifiedBy != null || (user != null && v.SubmittedBy == user)))
                    .ProjectTo<ModList.Entry>(mapper.ConfigurationProvider, new { user })
                    .ToListAsync()
            };
        }
        else
        {
            return new ModList()
            {
                Entries = await context.Mods
                    .ProjectTo<ModList.Entry>(mapper.ConfigurationProvider, new { user = (User?)null })
                    .Where(entry => entry.Versions.Any())
                    .ToListAsync()
            };
        }
    }

    [HttpGet("download/{id}/{version}")]
    [Produces("application/octet-stream")]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(VersionResult))]
    public async Task<IActionResult> Download([FromRoute] Guid id, [FromRoute] string version)
    {
        var isAdmin = loginService.IsLoggedIn(HttpContext) && (await loginService.GetUser(this.HttpContext))?.IsAdmin == true;

        var url = await context.ModVersion
            .Where(v => v.Version == version && (isAdmin || v.VerifiedBy != null) && v.OwnedBy.Guid == id)
            .Select(v => v.Download.Url)
            .SingleOrDefaultAsync();

        if (url == null)
        {
            return this.NotFound(new VersionResult(id, version));
        }

        return this.Redirect(url);
    }

    [HttpPost("create/version/{id}")]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(int))]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
    [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(VersionResult))]
    public async Task<ActionResult<VersionResult>> UploadVersion([FromBody]VersionUpload versionUpload, [FromRoute]Guid id)
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

            var mod = await context.Mods
                    .Include(m => m.Versions)
                    .FirstOrDefaultAsync(m => m.Guid == id);
            if (mod == null)
            {
                return this.NotFound(id);
            }

            if (mod.Versions.Any(v => v.Version == versionUpload.Version))
            {
                return this.Conflict(new {id, version = versionUpload.Version});
            }

            var storedObject = user.StoredObjects.Where(so => versionUpload.StoredObject == so.Id).FirstOrDefault();
            if (storedObject == null)
            {
                return this.NotFound(versionUpload.StoredObject);
            }

            mod.Versions.Add(new ModVersion()
            {
                Version = versionUpload.Version,
                SubmittedOn = DateTime.Now,
                SubmittedBy = user,
                Download =  new()
                {
                    Url = this.cdn + "/storage/download/" + storedObject.Id,
                    StoredObject = storedObject,
                },
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

    [HttpPost("create/new")]
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
                return this.Conflict(data.Name);
            }
            if (await context.Mods.AnyAsync(m => m.Info.Name == data.Name))
            {
                return this.Conflict(data.Name);
            }

            var added = new Mod()
            {
                Guid = data.Id,
                Info = new ModInfo()
                {
                    Name = data.Name,
                    Description = data.Description,
                },
                Versions = [],
                Author = user,
            };

            user.Mods.Add(added);

            await transaction.CommitAsync();

            await context.SaveChangesAsync();

            return new IdResult(added.Guid);
        }
        catch
        {
            return this.BadRequest();
        }
    }

    [HttpPost("delete/{id}")]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(IdResult))]
    public async Task<ActionResult<IdResult>> DeleteMod([FromRoute]Guid id)
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
                ? user.Mods.FirstOrDefault(m => m.Guid == id)
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

    [HttpPost("delete/{id}/{version}")]
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

            var mod = !user.IsAdmin
                ? user.Mods.FirstOrDefault(m => m.Guid == id)
                : await context.Mods
                    .Include(m => m.Versions)
                    .ThenInclude(v => v.VerifiedBy)
                    .FirstOrDefaultAsync(m => m.Guid == id);

            if (mod == null)
            {
                return this.NotFound(new VersionResult(id, version));
            }

            var v = mod.Versions.FirstOrDefault(v => v.Version == version);
            if (v == null)
            {
                return this.NotFound(new VersionResult(id, version));
            }

            if (!user.IsAdmin && v.SubmittedBy != user)
            {
                if (v.VerifiedBy == null)
                {
                    return this.NotFound(new VersionResult(id, version)); //Pretend it doesn't exist
                }
                else
                {
                    return this.StatusCode(403);
                }
            }

            if (mod.Versions.Count == 1)
            {
                context.Mods.Remove(mod);
                await context.SaveChangesAsync();
                return this.Ok(new { id });
            }
            else
            {
                mod.Versions.Remove(v);
            }

            context.ModVersion.Remove(v);
            await context.SaveChangesAsync();
            return new VersionResult(id, version);
        }
        catch
        {
            return this.BadRequest();
        }
    }

    [HttpPost("verify/{id}/{version}")]
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

            var mod = await context.Mods
                    .Include(m => m.Versions)
                    .ThenInclude(v => v.VerifiedBy)
                    .FirstOrDefaultAsync(m => m.Guid == id);
            if (mod == null)
            {
                return this.NotFound(new { id, version });
            }

            var v = mod.Versions.FirstOrDefault(v => v.Version == version);
            if (v == null)
            {
                return this.NotFound(new { id, version });
            }

            if (v.VerifiedBy != null)
            {
                return this.Conflict(new { id, version }); 
            }

            v.VerifiedBy = user;
            await context.SaveChangesAsync();
            return this.Ok(new { id, version });
        }
        catch
        {
            return this.BadRequest();
        }
    }
}
