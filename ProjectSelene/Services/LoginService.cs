using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ProjectSelene.Models;
using System.IdentityModel.Tokens.Jwt;

namespace ProjectSelene.Services;

public class LoginService
{
    private readonly ILogger logger;
    private readonly SymmetricSecurityKey jwtKey;
    private readonly SeleneDbContext context;
    private readonly string tokenIssuer;

    public LoginService(ILoggerFactory loggerFactory, IConfiguration configuration, SeleneDbContext context)
    {
        var jwtSecret = configuration["jwt_secret"] ?? throw new ArgumentNullException("jwt_secret", "jwt_secret is required");

        this.logger = loggerFactory.CreateLogger<LoginService>();
        this.jwtKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
        this.context = context;
        this.tokenIssuer = configuration["token_issuer"] ?? "";
    }
    public bool IsLoggedIn(HttpContext HttpContext)
    {
        return GetUserClaims(HttpContext).Claims.Any(c => c.Type == ClaimTypes.NameIdentifier);
    }

    public async Task<User> GetUser(HttpContext HttpContext)
    {
        var userClaims = this.GetUserClaims(HttpContext);
        var idClaim = userClaims.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (idClaim == null)
        {
            throw new UnauthorizedAccessException(); 
        }

        var id = int.Parse(idClaim.Value);

        var result = await this.context.Users
            .Include(u => u.Mods)
            .ThenInclude(m => m.Versions)
            .ThenInclude(v => v.Download)
            .Include(u => u.StoredObjects)
            .ThenInclude(o => o.Artifacts)
            .ThenInclude(a => a.ModVersions)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (result != null)
        {
            return result;
        }

        using var transaction = await this.context.Database.BeginTransactionAsync();

        var user = new User()
        {
            GithubId = id,
            IsAdmin = false,
            Mods = new List<Mod>(),
        };

        await this.context.Users.AddAsync(user);

        await this.context.SaveChangesAsync();
        await transaction.CommitAsync();

        return user;
    }

    public ClaimsPrincipal GetUserClaims(HttpContext HttpContext)
    {
        if (HttpContext == null
            || HttpContext.Request == null
            || HttpContext.Request.Headers == null
            || HttpContext.Request.Headers.Authorization.Count != 1)
        {
            return new ClaimsPrincipal();
        }

        string? auth = HttpContext.Request.Headers.Authorization[0];
        if (string.IsNullOrEmpty(auth)
            || !auth.StartsWith("Bearer "))
        {
            return new ClaimsPrincipal();
        }

        return GetUserClaims(auth.Substring("Bearer ".Length));
    }

    public ClaimsPrincipal GetUserClaims(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();

        if (string.IsNullOrEmpty(token) || !tokenHandler.CanReadToken(token))
        {
            return new ClaimsPrincipal();
        }

        try
        {
            return tokenHandler.ValidateToken(token, new TokenValidationParameters()
            {
                IssuerSigningKey = this.jwtKey,
                ValidateIssuer = true,
                ValidateIssuerSigningKey = true,
                ValidateAudience = false,
                ValidIssuer = this.tokenIssuer,
                ValidAlgorithms = new[] { "HS256" },
            }, out var _);
        }
        catch
        {
            return new ClaimsPrincipal();
        }
    }
}
