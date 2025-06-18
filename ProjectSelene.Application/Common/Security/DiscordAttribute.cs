namespace ProjectSelene.Application.Common.Security;

/// <summary>
/// Specifies the class this attribute is applied to requires a valid signature created by Discord.
/// </summary>
[AttributeUsage(AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
public class DiscordAttribute : Attribute { }
