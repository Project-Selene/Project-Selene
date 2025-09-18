namespace ProjectSelene.Application.User.Commnads.GenerateApiKey;

[Authorize]
public record GenerateApiKeyCommand : IRequest<string>
{
    public int ExpiresInDays { get; init; }
}


public class GenerateApiKeyCommandHandler(IApiKeyGenerator keyGenerator) : IRequestHandler<GenerateApiKeyCommand, string>
{
    public Task<string> Handle(GenerateApiKeyCommand request, CancellationToken cancellationToken)
    {
        return keyGenerator.GenerateApiKey(request.ExpiresInDays);
    }
}
