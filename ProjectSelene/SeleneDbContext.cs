using Microsoft.EntityFrameworkCore;

namespace ProjectSelene;

public class SeleneDbContext : DbContext
{
    public SeleneDbContext(DbContextOptions options) : base(options) { }
}
