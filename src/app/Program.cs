using Eolvis.App.Services;
using Eolvis.App.Services.Interfaces;
using Eolvis.App.Mcp;
using Microsoft.Identity.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);

// ── Configuration ──────────────────────────────────────────────────────────────
builder.Configuration.AddEnvironmentVariables("EOLVIS_");

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddAzureWebAppDiagnostics();

// ── Services ───────────────────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<IUserProfileService, UserProfileService>();
builder.Services.AddSingleton<IProjectService, ProjectService>();
builder.Services.AddSingleton<IComponentService, ComponentService>();
builder.Services.AddHttpContextAccessor();

builder.Services
    .AddMcpServer()
    .WithHttpTransport()
    .WithTools<ComponentSearchTool>();

// ── Authentication ─────────────────────────────────────────────────────────────
// In Azure App Service, Easy Auth stores the client secret in an env var.
// Use it as a fallback when appsettings has a placeholder.
var clientSecret = builder.Configuration["AzureAD:ClientSecret"];
var easyAuthSecret = Environment.GetEnvironmentVariable("MICROSOFT_PROVIDER_AUTHENTICATION_SECRET");
var isPlaceholder = string.IsNullOrWhiteSpace(clientSecret) || clientSecret.Contains("Enter_the_");

if (isPlaceholder && !string.IsNullOrWhiteSpace(easyAuthSecret))
    builder.Configuration["AzureAD:ClientSecret"] = easyAuthSecret;

var isAuthConfigured = !string.IsNullOrWhiteSpace(builder.Configuration["AzureAD:TenantId"])
    && !string.IsNullOrWhiteSpace(builder.Configuration["AzureAD:ClientSecret"])
    && !builder.Configuration["AzureAD:ClientSecret"]!.Contains("Enter_the_");

if (isAuthConfigured)
{
    builder.Services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
        .AddMicrosoftIdentityWebApp(builder.Configuration.GetSection("AzureAD"));

    builder.Services.AddAuthentication()
        .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAD"));

    builder.Services.AddAuthorization(options =>
    {
        options.AddPolicy("McpAccess", policy =>
            policy.RequireAuthenticatedUser()
                  .AddAuthenticationSchemes(JwtBearerDefaults.AuthenticationScheme));
    });

    // Return 401 for API/MCP requests instead of redirecting to the login page.
    builder.Services.Configure<OpenIdConnectOptions>(OpenIdConnectDefaults.AuthenticationScheme, options =>
    {
        options.Events ??= new OpenIdConnectEvents();
        options.Events.OnRedirectToIdentityProvider = context =>
        {
            if (context.Request.Path.StartsWithSegments("/api") ||
                context.Request.Path.StartsWithSegments("/mcp"))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.HandleResponse();
            }
            return Task.CompletedTask;
        };
    });
}
else
{
    builder.Services.AddAuthorization(options =>
    {
        var allowAll = new AuthorizationPolicyBuilder().RequireAssertion(_ => true).Build();
        options.DefaultPolicy = allowAll;
        options.AddPolicy("McpAccess", allowAll);
    });
    Console.WriteLine("WARNING: AzureAD not configured. Running without authentication.");
}

// ── Middleware pipeline ────────────────────────────────────────────────────────
var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.UseDeveloperExceptionPage();

app.UseSwagger();
app.UseSwaggerUI();

if (isAuthConfigured)
{
    app.UseAuthentication();

    // MCP: return 401 + WWW-Authenticate with resource metadata for unauthenticated requests.
    app.Use(async (context, next) =>
    {
        if (context.Request.Path.StartsWithSegments("/mcp"))
        {
            var auth = context.Request.Headers.Authorization.ToString();
            if (string.IsNullOrEmpty(auth) || !auth.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                var baseUrl = $"{context.Request.Scheme}://{context.Request.Host}";
                context.Response.StatusCode = 401;
                context.Response.Headers["WWW-Authenticate"] =
                    $"Bearer resource_metadata=\"{baseUrl}/.well-known/oauth-protected-resource/mcp\"";
                return;
            }
        }
        await next();
    });

    // Require login for page requests before static files are served.
    app.Use(async (context, next) =>
    {
        var path = context.Request.Path.Value ?? "";
        if ((path == "/" || path.EndsWith(".html", StringComparison.OrdinalIgnoreCase))
            && !(context.User.Identity?.IsAuthenticated ?? false))
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

// CSRF: require X-Requested-With header on mutating API requests.
app.Use(async (context, next) =>
{
    var method = context.Request.Method;
    if ((method is "POST" or "PUT" or "DELETE" or "PATCH")
        && context.Request.Path.StartsWithSegments("/api")
        && !context.Request.Headers.ContainsKey("X-Requested-With"))
    {
        context.Response.StatusCode = 403;
        await context.Response.WriteAsync("Forbidden: missing required request header.");
        return;
    }
    await next();
});

app.MapControllers();
app.MapOAuthProxyEndpoints();
app.MapMcp("/mcp").RequireAuthorization("McpAccess");

app.Run();
