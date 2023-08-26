using Microsoft.Azure.Cosmos;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using ProjectSelene;
using ProjectSelene.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme."

    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

builder.Services.AddControllers();

builder.Services.AddScoped<LoginService>();
#if DEBUG
builder.Services.AddSingleton<IStorageProviderService, FSStorageService>();
#else
builder.Services.AddSingleton<IStorageProviderService, AWSStorageService>();
#endif

builder.Services.AddSingleton((_) => {
    var client = new HttpClient();
    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    client.DefaultRequestHeaders.UserAgent.Clear();
    client.DefaultRequestHeaders.UserAgent.Add(new ProductInfoHeaderValue(new ProductHeaderValue(builder.Configuration["github_client_name"])));
    return client;
});

//var connectionString = builder.Configuration.GetConnectionString("SeleneMariaDb");ddddd
//builder.Services.AddDbContext<SeleneDbContext>(options => options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));


builder.Services.AddDbContext<SeleneDbContext>(options => options.UseSqlite(builder.Configuration.GetConnectionString("SeleneSqliteDb")));

//builder.Services.AddMvc();

const string localCorsPolicyName = "_allowLocalhostCORS";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: localCorsPolicyName,
                      policy =>
                      {
                          policy.WithOrigins(builder.Configuration["Domains:UI"], builder.Configuration["Domains:API"], builder.Configuration["Domains:CDN"]);
                      });
});

var app = builder.Build();

using (var serviceScope = app.Services.GetRequiredService<IServiceScopeFactory>().CreateScope())
{
    var context = serviceScope.ServiceProvider.GetService<SeleneDbContext>();
    if (context != null)
    {
        //context.Database.EnsureCreated();
        await context.Database.MigrateAsync();
    }
}

app.UseCors(localCorsPolicyName);

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.MapControllers();

app.Run();