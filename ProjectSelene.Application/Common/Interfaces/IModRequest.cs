namespace ProjectSelene.Application.Common.Interfaces;
internal interface IModRequest
{
    Guid ModId { get; }
    string Version { get; }
}
