#if false
using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;

namespace ProjectSelene.Services;

public class AWSStorageService : IStorageProviderService, IDisposable
{
    private readonly IAmazonS3 s3Client;

    public AWSStorageService(IConfiguration configuration)
    {
        var awsAccessKey = configuration["aws_access_key"] ?? throw new ArgumentNullException("aws_access_key", "aws_access_key is required for AWSStorageService");
        var awsSecretKey = configuration["aws_secret_key"] ?? throw new ArgumentNullException("aws_secret_key", "aws_secret_key is required for AWSStorageService");
        var awsServiceUrl = configuration["aws_service_url"] ?? throw new ArgumentNullException("aws_service_url", "aws_service_url is required for AWSStorageService");
        AWSConfigs.LoggingConfig.LogTo = LoggingOptions.Console;
        var credentials = new BasicAWSCredentials(awsAccessKey, awsSecretKey);
        this.s3Client = new AmazonS3Client(credentials, new AmazonS3Config
        {
            ServiceURL = awsServiceUrl,

        });
    }

    public async Task<string> Upload(Stream content, CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(content);
        var data = await reader.ReadToEndAsync().WaitAsync(cancellationToken);

        string id = Guid.NewGuid().ToString();
        var result = await s3Client.PutObjectAsync(new PutObjectRequest()
        {
            ContentBody = data,
            DisablePayloadSigning = true,
            BucketName = "selene",
            Key = id,
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

    public async Task Download(string id, Stream target, CancellationToken cancellationToken)
    {
        var response = await this.s3Client.GetObjectAsync("selene", id, cancellationToken);
        await response.ResponseStream.CopyToAsync(target, cancellationToken);
    }

    public async Task Delete(string id, CancellationToken cancellationToken)
    {
        await this.s3Client.DeleteAsync("selene", id, new Dictionary<string, object>(), cancellationToken);
    }

    public void Dispose() => this.s3Client.Dispose();
}
#endif
