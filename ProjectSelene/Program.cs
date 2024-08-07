using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using ProjectSelene;
using ProjectSelene.DTOs.AutoMapper;
using ProjectSelene.Services;
using ProjectSelene.Swagger;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
builder.Configuration.AddJsonFile("secrets/appsettings.secrets.json", optional: true);
builder.Configuration.AddEnvironmentVariables();

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SupportNonNullableReferenceTypes();
    c.SchemaFilter<RequiredNotNullableSchemaFilter>();
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
            Array.Empty<string>()
        }
    });
});

builder.Services.AddAutoMapper(typeof(ModProfile).Assembly);
builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddScoped<LoginService>();
//#if DEBUG
builder.Services.AddSingleton<IStorageProviderService, FSStorageService>();
//#else
//builder.Services.AddSingleton<IStorageProviderService, AWSStorageService>();
//#endif

builder.Services.AddSingleton((_) =>
{
    var client = new HttpClient();
    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    client.DefaultRequestHeaders.UserAgent.Clear();
    client.DefaultRequestHeaders.UserAgent.Add(new ProductInfoHeaderValue(new ProductHeaderValue(builder.Configuration["github_client_name"] ?? "")));
    return client;
});

//var connectionString = builder.Configuration.GetConnectionString("SeleneMariaDb");
//builder.Services.AddDbContext<SeleneDbContext>(options => options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddDbContext<SeleneDbContext>(options => options.UseSqlite(builder.Configuration.GetConnectionString("SeleneSqliteDb")));

//builder.Services.AddMvc();

const string localCorsPolicyName = "_allowLocalhostCORS";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: localCorsPolicyName,
                      policy =>
                      {
                          policy.WithOrigins(
                          [
                              .. (builder.Configuration.GetSection("Domains:UI").Get<List<string>>() ?? []),
                              builder.Configuration["Domains:API"] ?? "",
                              builder.Configuration["Domains:CDN"] ?? "",
                          ]);
                          policy.WithHeaders("content-type", "authorization");
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

if (!app.Environment.IsDevelopment())
{
    app.UseStaticFiles();
}

app.UseCors(localCorsPolicyName);

app.Use((context, next) =>
{
    context.Request.EnableBuffering();
    return next();
});

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseStaticFiles();

//app.UseHttpsRedirection();

app.MapControllers();

app.Run();