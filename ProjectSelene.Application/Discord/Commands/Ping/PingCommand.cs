namespace ProjectSelene.Application.Discord.Commands.Ping;

public record PingCommand : IRequest<PingResultDto>
{
    public required string Id { get; init; }
    public required string Token { get; init; }
}

public class PingCommandHandler : IRequestHandler<PingCommand, PingResultDto>
{
    public ValueTask<PingResultDto> Handle(PingCommand request, CancellationToken cancellationToken)
    {
        return new(new PingResultDto());
    }
}
