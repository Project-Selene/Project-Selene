global using Microsoft.Azure.Functions.Worker;
global using Microsoft.Azure.Functions.Worker.Http;
global using Microsoft.Extensions.Configuration;

using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using ProjectSelene;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;
using System.Reflection;

var host = new HostBuilder()
    .ConfigureAppConfiguration(builder => builder.AddUserSecrets(Assembly.GetExecutingAssembly(), true))
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices((ctx, services) =>
    {
        services.AddSingleton((_) => {
            var client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            client.DefaultRequestHeaders.UserAgent.Clear();
            client.DefaultRequestHeaders.UserAgent.Add(new ProductInfoHeaderValue(new ProductHeaderValue(ctx.Configuration["github_client_name"])));
            return client;
            });
        services.AddScoped<LoginController>();
        services.AddDbContext<SeleneDbContext>(options => options.UseCosmos(ctx.Configuration.GetConnectionString("SeleneDb"), "SeleneDb"));

        Singletons.Register(services);
    })
    .Build();

host.Run();