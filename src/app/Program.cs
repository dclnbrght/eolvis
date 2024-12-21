using Eolvis.App.Services;
using Eolvis.App.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Identity.Web;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<IUserProfileService, UserProfileService>();
builder.Services.AddSingleton<IProjectService, ProjectService>();
builder.Services.AddSingleton<IComponentService, ComponentService>();

builder.Services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
        .AddMicrosoftIdentityWebApp(builder.Configuration.GetSection("AzureAD"));

builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
 if (builder.Environment.IsDevelopment())
{
        builder.Configuration.AddJsonFile("appsettings.Development.json", optional: false, reloadOnChange: true);
}
builder.Configuration.AddEnvironmentVariables("EOLVIS_");

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddAzureWebAppDiagnostics();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
