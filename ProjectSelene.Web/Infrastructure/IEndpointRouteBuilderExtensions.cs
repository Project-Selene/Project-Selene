using System.Diagnostics.CodeAnalysis;

namespace ProjectSelene.Web.Infrastructure;

public static class IEndpointRouteBuilderExtensions
{
    public static IEndpointRouteBuilder MapGet(this IEndpointRouteBuilder builder, Delegate handler, [StringSyntax("Route")] string pattern = "")
    {
        PreventAnonymousMethod(handler);

        builder.MapGet(pattern, handler)
            .WithName(handler.Method.Name);

        return builder;
    }

    public static IEndpointRouteBuilder MapPost(this IEndpointRouteBuilder builder, Delegate handler, [StringSyntax("Route")] string pattern = "")
    {
        PreventAnonymousMethod(handler);

        builder.MapPost(pattern, handler)
            .WithName(handler.Method.Name);

        return builder;
    }

    public static IEndpointRouteBuilder MapPut(this IEndpointRouteBuilder builder, Delegate handler, [StringSyntax("Route")] string pattern)
    {
        PreventAnonymousMethod(handler);

        builder.MapPut(pattern, handler)
            .WithName(handler.Method.Name);

        return builder;
    }

    public static IEndpointRouteBuilder MapDelete(this IEndpointRouteBuilder builder, Delegate handler, [StringSyntax("Route")] string pattern)
    {
        PreventAnonymousMethod(handler);

        builder.MapDelete(pattern, handler)
            .WithName(handler.Method.Name);

        return builder;
    }

    private static void PreventAnonymousMethod(Delegate input)
    {
        var invalidChars = new[] { '<', '>' };
        if (input.Method.Name.Any(invalidChars.Contains))
        {
            throw new ArgumentException("The endpoint name must be specified when using anonymous handlers.");
        }
    }
}
