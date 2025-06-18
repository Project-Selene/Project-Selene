namespace ProjectSelene.Application.Common.Interfaces;

public interface IApiKeyGenerator
{
    Task<string> GenerateApiKey(int expiresInDays);
}
