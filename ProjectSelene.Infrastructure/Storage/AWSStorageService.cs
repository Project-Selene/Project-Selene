using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using ProjectSelene.Application.Common.Interfaces;

namespace ProjectSelene.Infrastructure.Storage;

public record AWSStorageConfig
{
    public required string AWSAccessKey { get; set; }
    public required string AWSSecretKey { get; set; }
    public required string AWSServiceUrl { get; set; }
}

public class AWSStorageService : IStorageProviderService, IDisposable
{
    private readonly IAmazonS3 s3Client;

    public AWSStorageService(IOptions<AWSStorageConfig> configuration)
    {
        var config = configuration.Value ?? throw new ArgumentNullException(nameof(configuration), "AWSConfig is required for AWSStorageService");
        AWSConfigs.LoggingConfig.LogTo = LoggingOptions.Console;
        var credentials = new BasicAWSCredentials(config.AWSAccessKey, config.AWSSecretKey);
        this.s3Client = new AmazonS3Client(credentials, new AmazonS3Config
        {
            ServiceURL = config.AWSServiceUrl,
        });
    }

    public async Task<Guid> Upload(Stream content, CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(content);
        var data = await reader.ReadToEndAsync().WaitAsync(cancellationToken);

        var id = Guid.NewGuid();
        var result = await s3Client.PutObjectAsync(new PutObjectRequest()
        {
            ContentBody = data,
            DisablePayloadSigning = true,
            BucketName = "selene",
            Key = id.ToString(),
        }, cancellationToken);

        ////This should work but does not
        //using TransferUtility transferUtility = new TransferUtility(s3Client);
        //await transferUtility.UploadAsync(new TransferUtilityUploadRequest()
        //{
        //    BucketName = "selene",
        //    Key = id,
        //    InputStream = content,
        //    DisablePayloadSigning = true
        //}, cancellationToken);
        return id;
    }

    public async Task<Stream> Download(Guid id, CancellationToken cancellationToken)
    {
        var response = await this.s3Client.GetObjectAsync("selene", id.ToString(), cancellationToken);
        return response.ResponseStream;
    }

    public async Task Delete(Guid id, CancellationToken cancellationToken)
    {
        await this.s3Client.DeleteAsync("selene", id.ToString(), new Dictionary<string, object>(), cancellationToken);
    }

    public void Dispose() => this.s3Client.Dispose();
}
