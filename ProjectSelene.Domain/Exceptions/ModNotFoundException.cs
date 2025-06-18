namespace ProjectSelene.Domain.Exceptions;

public class ModNotFoundException(Guid guid) : Exception($"Mod with id \"{guid}\" could not be found.");
