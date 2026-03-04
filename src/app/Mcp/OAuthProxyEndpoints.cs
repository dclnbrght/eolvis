using System.Text.Json;
using Microsoft.AspNetCore.Authorization;

namespace Eolvis.App.Mcp;

/// <summary>
/// OAuth 2.0 proxy endpoints for MCP authentication.
/// VS Code's MCP client follows the MCP OAuth spec: it discovers authorization/token
/// endpoints via RFC 8414/9728 metadata, then uses Auth Code + PKCE to get a token.
/// These endpoints proxy the OAuth flow to Entra ID, translating between the MCP
/// client's expectations and Entra ID's requirements.
/// </summary>
public static class OAuthProxyEndpoints
{
    // Fields that get overridden or stripped when proxying to Entra ID.
    private static readonly HashSet<string> OverriddenFields = new(StringComparer.OrdinalIgnoreCase)
        { "client_id", "scope", "resource", "client_secret" };

    /// <summary>
    /// Build the external base URL, respecting X-Forwarded-* headers from
    /// Azure App Service's reverse proxy so published URLs are always HTTPS.
    /// </summary>
    private static string GetBaseUrl(HttpContext ctx)
    {
        var scheme = ctx.Request.Headers["X-Forwarded-Proto"].FirstOrDefault()
                     ?? ctx.Request.Scheme;
        var host   = ctx.Request.Headers["X-Forwarded-Host"].FirstOrDefault()
                     ?? ctx.Request.Host.ToString();
        return $"{scheme}://{host}";
    }

    public static void MapOAuthProxyEndpoints(this WebApplication app)
    {
        // RFC 8414 — Authorization Server Metadata
        app.MapGet("/.well-known/oauth-authorization-server", (HttpContext ctx, IConfiguration config) =>
        {
            var cid = config["AzureAD:ClientId"];
            var baseUrl = GetBaseUrl(ctx);
            return Results.Json(new
            {
                issuer = baseUrl,
                authorization_endpoint = $"{baseUrl}/authorize",
                token_endpoint = $"{baseUrl}/token",
                registration_endpoint = $"{baseUrl}/register",
                response_types_supported = new[] { "code" },
                grant_types_supported = new[] { "authorization_code" },
                code_challenge_methods_supported = new[] { "S256" },
                scopes_supported = GetScopes(cid)
            });
        }).AllowAnonymous();

        // RFC 7591 — Dynamic Client Registration (echo-style)
        // Returns the server's client_id and echoes back the client's redirect_uris
        // so each MCP client (VS Code, Copilot Studio, etc.) keeps using its own URI.
        app.MapPost("/register", async (HttpContext ctx, IConfiguration config) =>
        {
            var cid = config["AzureAD:ClientId"];
            var baseUrl = GetBaseUrl(ctx);
            var logger = ctx.RequestServices.GetRequiredService<ILoggerFactory>()
                .CreateLogger("OAuthProxy");

            // Parse optional redirect_uris from the request body.
            string[]? redirectUris = null;
            try
            {
                using var doc = await JsonDocument.ParseAsync(ctx.Request.Body);
                logger.LogInformation("POST /register body: {Body}", doc.RootElement.ToString());
                if (doc.RootElement.TryGetProperty("redirect_uris", out var elem)
                    && elem.ValueKind == JsonValueKind.Array)
                {
                    redirectUris = elem.EnumerateArray()
                        .Where(e => e.ValueKind == JsonValueKind.String)
                        .Select(e => e.GetString()!)
                        .ToArray();
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "POST /register — failed to parse body");
            }

            var response = new
            {
                client_id = cid,
                client_id_issued_at = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                token_endpoint_auth_method = "none",
                grant_types = new[] { "authorization_code" },
                response_types = new[] { "code" },
                redirect_uris = redirectUris ?? Array.Empty<string>(),
                scope = GetScopeString(cid),
                registration_client_uri = $"{baseUrl}/register"
            };
            logger.LogInformation("POST /register response: {Response}",
                JsonSerializer.Serialize(response));
            return Results.Json(response, statusCode: StatusCodes.Status201Created);
        }).AllowAnonymous();

        // RFC 9728 — Protected Resource Metadata (base + path-specific)
        app.MapGet("/.well-known/oauth-protected-resource/{**path}", (HttpContext ctx, IConfiguration config) =>
        {
            var cid = config["AzureAD:ClientId"];
            var baseUrl = GetBaseUrl(ctx);
            return Results.Json(new
            {
                resource = $"{baseUrl}/mcp",
                authorization_servers = new[] { baseUrl },
                scopes_supported = GetScopes(cid),
                bearer_methods_supported = new[] { "header" }
            });
        }).AllowAnonymous();

        // /authorize — redirect to Entra ID with corrected client_id and scope
        app.MapGet("/authorize", (HttpContext ctx, IConfiguration config) =>
        {
            var tid = config["AzureAD:TenantId"];
            var cid = config["AzureAD:ClientId"];
            var logger = ctx.RequestServices.GetRequiredService<ILoggerFactory>()
                .CreateLogger("OAuthProxy");
            var entraUrl = $"https://login.microsoftonline.com/{tid}/oauth2/v2.0/authorize";

            logger.LogInformation("GET /authorize query: {Query}", ctx.Request.QueryString);

            var parameters = new List<string>
            {
                $"client_id={Uri.EscapeDataString(cid!)}",
                $"scope={Uri.EscapeDataString(GetScopeString(cid))}"
            };

            foreach (var param in ctx.Request.Query)
            {
                if (!OverriddenFields.Contains(param.Key))
                    parameters.Add($"{param.Key}={Uri.EscapeDataString(param.Value.ToString())}");
            }

            var redirectTarget = $"{entraUrl}?{string.Join("&", parameters)}";
            logger.LogInformation("GET /authorize redirecting to: {Url}", redirectTarget);
            return Results.Redirect(redirectTarget);
        }).AllowAnonymous();

        // /token — proxy token exchange to Entra ID (public client flow, PKCE only)
        app.MapPost("/token", async (HttpContext ctx, IConfiguration config) =>
        {
            var tid = config["AzureAD:TenantId"];
            var cid = config["AzureAD:ClientId"];
            var logger = ctx.RequestServices.GetRequiredService<ILoggerFactory>()
                .CreateLogger("OAuthProxy");
            var entraTokenUrl = $"https://login.microsoftonline.com/{tid}/oauth2/v2.0/token";

            var form = await ctx.Request.ReadFormAsync();
            logger.LogInformation("POST /token form fields: {Fields}",
                string.Join(", ", form.Keys));

            var formData = new Dictionary<string, string>
            {
                ["client_id"] = cid!,
                ["scope"] = GetScopeString(cid)
            };

            // Entra requires client_secret for confidential-client token exchanges.
            var secret = config["AzureAD:ClientSecret"];
            if (!string.IsNullOrWhiteSpace(secret))
                formData["client_secret"] = secret;

            foreach (var field in form)
            {
                if (!OverriddenFields.Contains(field.Key))
                    formData[field.Key] = field.Value.ToString();
            }

            using var httpClient = new HttpClient();
            var response = await httpClient.PostAsync(entraTokenUrl, new FormUrlEncodedContent(formData));
            var responseBody = await response.Content.ReadAsStringAsync();
            logger.LogInformation("POST /token Entra response: {Status} {Body}",
                (int)response.StatusCode, responseBody);

            ctx.Response.StatusCode = (int)response.StatusCode;
            ctx.Response.ContentType = response.Content.Headers.ContentType?.ToString() ?? "application/json";
            await ctx.Response.WriteAsync(responseBody);
        }).AllowAnonymous();
    }

    private static string GetScopeString(string? clientId) =>
        $"api://{clientId}/Components.Search openid profile";

    private static string[] GetScopes(string? clientId) =>
        [$"api://{clientId}/Components.Search", "openid", "profile"];
}
