using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectSelene.DTOs;

namespace ProjectSelene.Controllers;

[Route("mod")]
public class ModController : Controller
{
    private readonly SeleneDbContext context;

    public ModController(SeleneDbContext context)
    {
        this.context = context;
    }

    [HttpGet("list")]
    public async Task<ModList> GetModList()
    {
        return new ModList(
            await context.Mods
                .Where(m => m.Versions.Any(v => v.VerifiedBy != null))
                .AsNoTracking()
                .Select(m => new ModList.Entry(m.Id, m.Info.Name, m.Info.Description, m.Versions.OrderByDescending(v => v.SubmittedOn).Select(v => v.Version).First())) //TODO: better latest version
                .ToListAsync());
    }
}
