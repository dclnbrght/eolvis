using Eolvis.App.Services;
using Eolvis.App.Services.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Identity.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<IUserProfileService, UserProfileService>();
builder.Services.AddSingleton<IProjectService, ProjectService>();
builder.Services.AddSingleton<IComponentService, ComponentService>();

// Only register OIDC auth when AzureAD is configured (i.e. not local dev with placeholder values).
var tenantId = builder.Configuration.GetValue<string>("AzureAD:TenantId");
var isAuthConfigured = !string.IsNullOrWhiteSpace(tenantId)
    && !tenantId.Contains("Enter_the_", StringComparison.OrdinalIgnoreCase);

if (isAuthConfigured)
{
    builder.Services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
            .AddMicrosoftIdentityWebApp(builder.Configuration.GetSection("AzureAD"));

    // Return 401 for API requests instead of redirecting to the login page.
    // This allows the frontend fetch() calls to detect expired sessions
    // and redirect to the auth endpoint explicitly.
    builder.Services.Configure<OpenIdConnectOptions>(OpenIdConnectDefaults.AuthenticationScheme, options =>
    {
        var existingRedirectHandler = options.Events?.OnRedirectToIdentityProvider;
        options.Events ??= new OpenIdConnectEvents();
        options.Events.OnRedirectToIdentityProvider = async context =>
        {
            if (context.Request.Path.StartsWithSegments("/api"))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.HandleResponse();
                return;
            }

            if (existingRedirectHandler != null)
            {
                await existingRedirectHandler(context);
            }
        };
    });
}
else
{
    // No-op auth for local development: allow all requests through [Authorize] attributes.
    builder.Services.AddAuthorization(options =>
    {
        options.DefaultPolicy = new AuthorizationPolicyBuilder()
            .RequireAssertion(_ => true)
            .Build();
    });
    Console.WriteLine("WARNING: AzureAD TenantId is not configured. Running without authentication. Do NOT use this in production.");
}

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

if (isAuthConfigured)
{
    app.UseAuthentication();

    // Require authentication for page requests (/, *.html) before serving static files.
    // This triggers the OIDC login flow on the very first visit, so users never see
    // the app shell without a valid session.
    app.Use(async (context, next) =>
    {
        var path = context.Request.Path.Value ?? "";
        var isPageRequest = path == "/" || path.EndsWith(".html", StringComparison.OrdinalIgnoreCase);

        if (isPageRequest && !(context.User.Identity?.IsAuthenticated ?? false))
        {
            await context.ChallengeAsync(OpenIdConnectDefaults.AuthenticationScheme);
            return;
        }

        await next();
    });
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthorization();

// CSRF protection: require X-Requested-With header on mutating API requests.
// Browsers enforce a CORS preflight for custom headers, so cross-origin POST/PUT/DELETE
// requests from malicious sites will be blocked. Same-origin SPA requests include the
// header via fetchWithAuth. SameSite=Lax on auth cookies provides defence-in-depth.
app.Use(async (context, next) =>
{
    var method = context.Request.Method;
    var isMutating = method == "POST" || method == "PUT" || method == "DELETE" || method == "PATCH";

    if (isMutating && context.Request.Path.StartsWithSegments("/api"))
    {
        if (!context.Request.Headers.ContainsKey("X-Requested-With"))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsync("Forbidden: missing required request header.");
            return;
        }
    }

    await next();
});

app.MapControllers();

app.Run();
