using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectSelene.DTOs;
using ProjectSelene.Models;
using ProjectSelene.Services;
using System.Transactions;

namespace ProjectSelene.Controllers;

[Route("mod")]
public class ModController : Controller
{
    private readonly SeleneDbContext context;
    private readonly LoginService loginService;

    public ModController(SeleneDbContext context, LoginService loginService)
    {
        this.context = context;
        this.loginService = loginService;
    }

    [HttpGet("list")]
    public async Task<ModList> GetModList()
    {
        if (this.loginService.IsLoggedIn(HttpContext))
        {
            var user = await this.loginService.GetUser(HttpContext);

            return new ModList(
                await this.context.Mods
                    .Include(m => m.Versions)
                    .ThenInclude(v => v.VerifiedBy)
                    .Where(m => m.Versions.Any(v => v.VerifiedBy != null || v.SubmittedBy == user))
                    .AsNoTracking()
                    .Select(m => new ModList.Entry(m.Id, m.Info.Name, m.Info.Description, m.Versions.First(v => v.VerifiedBy != null || v.SubmittedBy == user).Version))
                    .ToListAsync());
        }
        else
        {
            return new ModList(
                await this.context.Mods
                    .Include(m => m.Versions)
                    .ThenInclude(v => v.VerifiedBy)
                    .Where(m => m.Versions.Any(v => v.VerifiedBy != null))
                    .AsNoTracking()
                    .Select(m => new ModList.Entry(m.Id, m.Info.Name, m.Info.Description, m.Versions.First(v => v.VerifiedBy != null).Version))
                    .ToListAsync());
        }
    }

    [HttpGet("details/{id}")]
    public async Task<ActionResult<ModDetails>> GetModDetails([FromRoute] int id)
    {
        var mod = await this.context.Mods
                    .Include(m => m.Versions)
                    .ThenInclude(v => v.VerifiedBy)
                    .FirstOrDefaultAsync(m => m.Id == id);

        if (this.loginService.IsLoggedIn(HttpContext))
        {
            var user = await this.loginService.GetUser(HttpContext);

            if (mod == null || mod.Versions.All(v => v.VerifiedBy == null && v.SubmittedBy != user))
            {
                return this.NotFound(id);
            }

            return this.Ok(new ModDetails(mod, user));
        }
        else
        {
            if (mod == null || mod.Versions.All(v => v.VerifiedBy == null))
            {
                return this.NotFound(id);
            }

            return this.Ok(new ModDetails(mod, null));
        }
    }

    [HttpGet("details/{id}/{version}")]
    public async Task<ActionResult<VersionDetails>> GetVersionDetails([FromRoute] int id, [FromRoute] string version)
    {
        var mod = await this.context.Mods
                    .Include(m => m.Versions)
                    .ThenInclude(v => v.VerifiedBy)
                    .Include(m => m.Versions)
                    .ThenInclude(v => v.Artifacts)
                    .FirstOrDefaultAsync(m => m.Id == id);
        if (mod == null)
        {
            return this.NotFound(new { id, version });
        }

        var v = mod.Versions.FirstOrDefault(v => v.Version == version);
        if (v == null)
        {
            return this.NotFound(new { id, version });
        }

        if (v.VerifiedBy == null)
        {
            if (!this.loginService.IsLoggedIn(HttpContext))
            {
                return this.NotFound(new { id, version });
            }
            var user = await this.loginService.GetUser(HttpContext);
            if (v.SubmittedBy != user)
            {
                return this.NotFound(new { id, version });
            }
        }

        return this.Ok(new VersionDetails(v));
    }

    [HttpGet("download/{id}")]
    public async Task<IActionResult> Download([FromRoute] int id)
    {
        var url = (await this.context.Mods
            .AsNoTracking()
            .Where(mod => mod.Id == id)
            .Select(mod => mod.Versions.FirstOrDefault(v => v.VerifiedBy != null)!)
            .Where(v => v != null)
            .ToListAsync())
            .Select(version => version!.Artifacts.First())
            .Select(artifact => artifact.Url)
            .SingleOrDefault();
            
        if (url == null)
        {
            return this.NotFound(id);
        }

        return this.Redirect(url);
    }

    [HttpGet("download/{id}/{version}")]
    public async Task<IActionResult> Download([FromRoute] int id, [FromRoute] string version)
    {
        var url = (await this.context.Mods
            .AsNoTracking()
            .Where(mod => mod.Id == id)
            .Select(mod => mod.Versions.First(v => v.Version == version && v.VerifiedBy != null))
            .Where(v => v != null)
            .ToListAsync())
            .Select(version => version!.Artifacts.First())
            .Select(artifact => artifact.Url)
            .SingleOrDefault();

        if (url == null)
        {
            return this.NotFound(new { id, version });
        }

        return this.Redirect(url);
    }


    [HttpGet("download/{id}/{version}/{artifact}")]
    public async Task<IActionResult> Download([FromRoute] int id, [FromRoute] string version, [FromRoute] int artifact)
    {
        var url = (await this.context.Mods
            .AsNoTracking()
            .Where(mod => mod.Id == id)
            .Select(mod => mod.Versions.First(v => v.Version == version && v.VerifiedBy != null))
            .Where(v => v != null)
            .ToListAsync())
            .Select(version => version!.Artifacts.ElementAtOrDefault(artifact))
            .Where(artifact => artifact != null)
            .Select(artifact => artifact!.Url)
            .SingleOrDefault();

        if (url == null)
        {
            return this.NotFound(new { id, version, artifact });
        }

        return this.Redirect(url);
    }

    [HttpPost("create/version/{id}")]
    public async Task<IActionResult> UploadVersion([FromBody]VersionUpload versionUpload, [FromRoute]int id)
    {
        if (!loginService.IsLoggedIn(HttpContext))
        {
            return this.StatusCode(403);
        }

        if (!ModelState.IsValid)
        {
            return this.BadRequest();
        }

        try
        {
            var user = await this.loginService.GetUser(HttpContext);

            using var transaction = new TransactionScope();

            var mod = await this.context.Mods
                    .Include(m => m.Versions)
                    .FirstOrDefaultAsync(m => m.Id == id);
            if (mod == null)
            {
                return this.NotFound(id);
            }

            if (mod.Versions.Any(v => v.Version == versionUpload.Version))
            {
                return this.Conflict(new {id, version = versionUpload.Version});
            }

            mod.Versions.Add(new ModVersion()
            {
                Version = versionUpload.Version,
                SubmittedOn = DateTime.Now,
                SubmittedBy = user,
                Artifacts = versionUpload.Artifacts.Select(url => new Artifact()
                {
                    Url = url
                }).ToList()
            });

            await this.context.SaveChangesAsync();

            transaction.Complete();
        }
        catch
        {
            return this.BadRequest();
        }

        return Ok(new { id, version = versionUpload.Version });
    }

    [HttpPost("create/new")]
    public async Task<IActionResult> CreateNewMod([FromBody] CreateMod data)
    {
        if (!loginService.IsLoggedIn(HttpContext))
        {
            return this.StatusCode(403);
        }

        if (!ModelState.IsValid)
        {
            return this.BadRequest();
        }

        try
        {
            var user = await this.loginService.GetUser(HttpContext);

            using var transaction = await this.context.Database.BeginTransactionAsync();


            if (await this.context.Mods.AnyAsync(m => m.Info.Name == data.Name))
            {
                return this.Conflict(new { name = data.Name });
            }


            var added = new Mod()
            {
                Info = new ModInfo()
                {
                    Name = data.Name,
                    Description = data.Description,
                },
                Versions = new List<ModVersion>()
                {
                    new ModVersion()
                    {
                        Version = data.Version,
                        SubmittedOn = DateTime.Now,
                        SubmittedBy = user,
                        Artifacts = data.Artifacts.Select(url => new Artifact()
                        {
                            Url = url
                        }).ToList()

                    }
                }
            };

            user.Mods.Add(added);

            await this.context.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new { id = added.Id, version = data.Version });
        }
        catch
        {
            return this.BadRequest();
        }

    }

    [HttpPost("delete/{id}")]
    public async Task<IActionResult> DeleteMod([FromRoute]int id)
    {
        if (!this.loginService.IsLoggedIn(HttpContext))
        {
            return this.StatusCode(403);
        }

        try
        {
            var user = await this.loginService.GetUser(HttpContext);
            if (user == null)
            {
                return this.StatusCode(403);
            }

            var mod = !user.IsAdmin
                ? user.Mods.FirstOrDefault(m => m.Id == id)
                : await this.context.Mods
                    .Include(m => m.Versions)
                    .FirstOrDefaultAsync(m => m.Id == id);

            if (mod == null)
            {
                return this.NotFound(new { id });
            }

            if (user.IsAdmin)
            {
                this.context.Mods.Remove(mod);
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
                this.context.Mods.Remove(mod);
            }

            await this.context.SaveChangesAsync();
            return this.Ok(new { id });
        }
        catch
        {
            return this.BadRequest();
        }
    }

    [HttpPost("delete/{id}/{version}")]
    public async Task<IActionResult> DeleteVersion([FromRoute] int id, [FromRoute] string version)
    {
        if (!this.loginService.IsLoggedIn(HttpContext))
        {
            return this.StatusCode(403);
        }

        try
        {
            var user = await this.loginService.GetUser(HttpContext);
            if (user == null)
            {
                return this.StatusCode(403);
            }

            var mod = !user.IsAdmin
                ? user.Mods.FirstOrDefault(m => m.Id == id)
                : await this.context.Mods
                    .Include(m => m.Versions)
                    .ThenInclude(v => v.VerifiedBy)
                    .FirstOrDefaultAsync(m => m.Id == id);

            if (mod == null)
            {
                return this.NotFound(new { id, version });
            }

            var v = mod.Versions.FirstOrDefault(v => v.Id == id);
            if (v == null)
            {
                return this.NotFound(new { id, version });
            }

            if (!user.IsAdmin && v.SubmittedBy != user)
            {
                if (v.VerifiedBy == null)
                {
                    return this.NotFound(new { id, version }); //Pretend it doesn't exist
                }
                else
                {
                    return this.StatusCode(403);
                }
            }

            if (mod.Versions.Count() == 1)
            {
                this.context.Mods.Remove(mod);
                return this.Ok(new { id });
            }
            else
            {
                mod.Versions.Remove(v);
            }

            await this.context.SaveChangesAsync();
            return this.Ok(new { id, version });
        }
        catch
        {
            return this.BadRequest();
        }
    }

    [HttpPost("delete/{id}/{version}/{artifact}")]
    public async Task<IActionResult> DeleteArtifact([FromRoute] int id, [FromRoute] string version, [FromRoute] int artifact)
    {
        if (!this.loginService.IsLoggedIn(HttpContext))
        {
            return this.StatusCode(403);
        }

        try
        {
            var user = await this.loginService.GetUser(HttpContext);
            if (user == null)
            {
                return this.StatusCode(403);
            }

            var mod = !user.IsAdmin
                ? user.Mods.FirstOrDefault(m => m.Id == id)
                : await this.context.Mods
                    .Include(m => m.Versions)
                    .ThenInclude(v => v.VerifiedBy)
                    .Include(m => m.Versions)
                    .ThenInclude(v => v.Artifacts)
                    .FirstOrDefaultAsync(m => m.Id == id);

            if (mod == null)
            {
                return this.NotFound(new { id, version, artifact });
            }

            var v = mod.Versions.FirstOrDefault(v => v.Id == id);
            if (v == null)
            {
                return this.NotFound(new { id, version, artifact });
            }

            if (!user.IsAdmin && v.SubmittedBy != user)
            {
                if (v.VerifiedBy == null)
                {
                    return this.NotFound(new { id, version, artifact }); //Pretend it doesn't exist
                }
                else
                {
                    return this.StatusCode(403);
                }
            }

            var a = v.Artifacts.FirstOrDefault(a => a.Id == id);
            if (a == null)
            {
                return this.NotFound(new { id, version, artifact });
            }

            if (v.Artifacts.Count == 1)
            {
                if (mod.Versions.Count() == 1)
                {
                    this.context.Mods.Remove(mod);
                    await this.context.SaveChangesAsync();
                    return this.Ok(new { id });
                }
                else
                {
                    mod.Versions.Remove(v);
                    await this.context.SaveChangesAsync();
                    return this.Ok(new { id, version });
                }
            }
            else
            {
                v.Artifacts.Remove(a);
                await this.context.SaveChangesAsync();
                return this.Ok(new { id, version, artifact });
            }
        }
        catch
        {
            return this.BadRequest();
        }
    }

    [HttpPost("verify/{id}/{version}")]
    public async Task<IActionResult> Verify([FromRoute] int id, [FromRoute] string version)
    {
        if (!this.loginService.IsLoggedIn(HttpContext))
        {
            return this.StatusCode(403);
        }

        try
        {
            var user = await this.loginService.GetUser(HttpContext);
            if (user == null || !user.IsAdmin)
            {
                return this.StatusCode(403);
            }

            var mod = await this.context.Mods
                    .Include(m => m.Versions)
                    .ThenInclude(v => v.VerifiedBy)
                    .FirstOrDefaultAsync(m => m.Id == id);
            if (mod == null)
            {
                return this.NotFound(new { id, version });
            }

            var v = mod.Versions.FirstOrDefault(v => v.Id == id);
            if (v == null)
            {
                return this.NotFound(new { id, version });
            }

            if (v.VerifiedBy != null)
            {
                return this.Conflict(new { id, version }); 
            }

            v.VerifiedBy = user;
            await this.context.SaveChangesAsync();
            return this.Ok(new { id, version });
        }
        catch
        {
            return this.BadRequest();
        }
    }
}
