namespace ProjectSelene.Domain.Exceptions;

public class DuplicateModException(string guid) : Exception($"Mod with id \"{guid}\" already exists.");
