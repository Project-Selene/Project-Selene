using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using ProjectSelene.Application.Common.Models;
using ProjectSelene.Application.Storage.Commands.UploadArtifact;
using ProjectSelene.Application.Storage.Queries.Download;

namespace ProjectSelene.Web.Endpoints;

public class Storage : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .DisableAntiforgery()
            .MapPut(UploadArtifact, "{id}/{version}")
            .MapGet(DownloadArtifact, "{id}/{version}");
    }

    public async Task<Result> UploadArtifact(ISender sender, Guid id, string version, [FromForm] IFormFile file, IHttpContextAccessor contextAccessor, CancellationToken cancellationToken)
    {
        return await sender.Send(new UploadArtifactCommand()
        {
            ModId = id,
            Version = version,
            Content = file.OpenReadStream(),
        }, cancellationToken);
    }

    [Produces("application/octet-stream")]
    [ProducesResponseType(typeof(FileResult), 200)]
    public async Task<FileStreamHttpResult> DownloadArtifact(ISender sender, Guid id, string version, CancellationToken cancellationToken)
    {
        var downloadData = await sender.Send(new Download()
        {
            ModId = id,
            Version = version,
        }, cancellationToken);
        return TypedResults.File(downloadData.Stream, "application/octet-stream", $"{id}-{version}.mod", downloadData.LastModified);
    }
}
