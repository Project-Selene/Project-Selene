using Microsoft.AspNetCore.Mvc;
using ProjectSelene.Controllers;

namespace ProjectSelene.Functions;

internal class ModFunctions : AzureBaseController
{
    private readonly ModController modController;

    public ModFunctions(IServiceProvider serviceProvider, LoginController login) : base(serviceProvider)
    {
        this.modController = modController;
    }

    [Function("mod/list")]
    public Task<HttpResponseData> RedirectLogin([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        => DoGenericActionRequest(req, modController, async modController => (ActionResult<DTOs.ModList>)new OkObjectResult(await modController.GetModList()));
}
