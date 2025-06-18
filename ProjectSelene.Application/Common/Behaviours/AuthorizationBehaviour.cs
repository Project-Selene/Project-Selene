using ProjectSelene.Application.Common.Exceptions;
using System.Reflection;

namespace ProjectSelene.Application.Common.Behaviours;

public class AuthorizationBehaviour<TRequest, TResponse>(
    IUser user,
    IIdentityService identityService,
    IApplicationDbContext context) : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var authorizeAttributes = request.GetType().GetCustomAttributes<AuthorizeAttribute>();

        if (authorizeAttributes.Any())
        {
            if (request is IModRequest modRequestAnonymous)
            {
                if (authorizeAttributes.Any(a => a.AllowAnonymousIfVerified))
                {
                    var isVerified = await context.ModVersions
                        .AnyAsync(version =>
                            version.Version == modRequestAnonymous.Version
                            && version.Mod.Guid == modRequestAnonymous.ModId
                            && version.VerifiedOn != null,
                            cancellationToken);

                    if (isVerified)
                    {
                        // Resource is public, skip other checks
                        return await next();
                    }
                }
            }

            // Must be authenticated user
            if (user.Id == null)
            {
                throw new UnauthorizedAccessException();
            }

            if (request is IModRequest modRequest)
            {
                if (authorizeAttributes.Any(a => a.AllowOwner))
                {
                    var isOwner = await context.ModVersions
                        .AnyAsync(version =>
                            version.Version == modRequest.Version
                            && version.Mod.Guid == modRequest.ModId
                            && version.CreatedById == user.Id,
                            cancellationToken);

                    if (isOwner)
                    {
                        // User is the owner of the mod version, skip other checks
                        return await next();
                    }
                }
            }

            // Role-based authorization
            var authorizeAttributesWithRoles = authorizeAttributes.Where(a => !string.IsNullOrWhiteSpace(a.Roles));

            if (authorizeAttributesWithRoles.Any())
            {
                var authorized = false;

                foreach (var roles in authorizeAttributesWithRoles.Select(a => a.Roles.Split(',')))
                {
                    foreach (var role in roles)
                    {
                        var isInRole = await identityService.IsInRoleAsync(user.Id, role.Trim());
                        if (isInRole)
                        {
                            authorized = true;
                            break;
                        }
                    }
                }

                // Must be a member of at least one role in roles
                if (!authorized)
                {
                    throw new ForbiddenAccessException();
                }
            }

            // Policy-based authorization
            var authorizeAttributesWithPolicies = authorizeAttributes.Where(a => !string.IsNullOrWhiteSpace(a.Policy));
            if (authorizeAttributesWithPolicies.Any())
            {
                foreach (var policy in authorizeAttributesWithPolicies.Select(a => a.Policy))
                {
                    var authorized = await identityService.AuthorizeAsync(user.Id, policy);

                    if (!authorized)
                    {
                        throw new ForbiddenAccessException();
                    }
                }
            }
        }

        // User is authorized / authorization not required
        return await next();
    }
}
