using Microsoft.AspNetCore.Identity;

namespace ProjectSelene.Domain.Entities;

public class SeleneUser : IdentityUser
{
    public DateTimeOffset? ApiKeyExpires { get; set; }

    public ICollection<Mod> Mods { get; set; } = [];
    public ICollection<Artifact> Artifacts { get; init; } = [];

    public class Configuration : IEntityTypeConfiguration<SeleneUser>
    {
        public void Configure(EntityTypeBuilder<SeleneUser> builder)
        {
            builder.HasMany(m => m.Mods)
                .WithOne();

            builder.HasMany(m => m.Artifacts)
                .WithOne();
        }
    }
}
