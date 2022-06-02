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

    public LoginService(ILoggerFactory loggerFactory, IConfiguration configuration, SeleneDbContext context)
    {
        this.logger = loggerFactory.CreateLogger<LoginService>();
        this.jwtKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["jwt_secret"]));
        this.context = context;
    }
    public bool IsLoggedIn(HttpContext HttpContext)
    {
        return GetUserClaims(HttpContext).Claims.Any(c => c.Type == ClaimTypes.NameIdentifier);
    }

    public async Task<User> GetUser(HttpContext HttpContext)
    {
        var userClaims = this.GetUserClaims(HttpContext);
        var githubIdClaim = userClaims.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (githubIdClaim == null)
        {
            throw new UnauthorizedAccessException(); 
        }

        var id = int.Parse(githubIdClaim.Value);

        var result = this.context.Users
            .Include(u => u.Mods)
            .ThenInclude(m => m.Versions)
            .ThenInclude(v => v.Artifacts)
            .FirstOrDefault(c => c.GithubId == id);
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

        this.context.Users.Add(user);

        this.context.SaveChanges();
        transaction.Commit();

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

        string auth = HttpContext.Request.Headers.Authorization[0];
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
                ValidIssuer = "https://functionsproject.azurewebsites.net/",
                ValidAlgorithms = new[] { "HS256" },
            }, out var _);
        }
        catch
        {
            return new ClaimsPrincipal();
        }
    }
}
