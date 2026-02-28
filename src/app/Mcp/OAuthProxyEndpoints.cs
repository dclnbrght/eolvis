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

    public static void MapOAuthProxyEndpoints(this WebApplication app)
    {
        // RFC 8414 — Authorization Server Metadata
        app.MapGet("/.well-known/oauth-authorization-server", (HttpContext ctx, IConfiguration config) =>
        {
            var cid = config["AzureAD:ClientId"];
            var baseUrl = $"{ctx.Request.Scheme}://{ctx.Request.Host}";
            return Results.Json(new
            {
                issuer = baseUrl,
                authorization_endpoint = $"{baseUrl}/authorize",
                token_endpoint = $"{baseUrl}/token",
                registration_endpoint = (string?)null,
                response_types_supported = new[] { "code" },
                grant_types_supported = new[] { "authorization_code" },
                code_challenge_methods_supported = new[] { "S256" },
                scopes_supported = GetScopes(cid)
            });
        }).AllowAnonymous();

        // RFC 9728 — Protected Resource Metadata (base + path-specific)
        app.MapGet("/.well-known/oauth-protected-resource/{**path}", (HttpContext ctx, IConfiguration config) =>
        {
            var cid = config["AzureAD:ClientId"];
            var baseUrl = $"{ctx.Request.Scheme}://{ctx.Request.Host}";
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
            var entraUrl = $"https://login.microsoftonline.com/{tid}/oauth2/v2.0/authorize";

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

            return Results.Redirect($"{entraUrl}?{string.Join("&", parameters)}");
        }).AllowAnonymous();

        // /token — proxy token exchange to Entra ID (public client flow, PKCE only)
        app.MapPost("/token", async (HttpContext ctx, IConfiguration config) =>
        {
            var tid = config["AzureAD:TenantId"];
            var cid = config["AzureAD:ClientId"];
            var entraTokenUrl = $"https://login.microsoftonline.com/{tid}/oauth2/v2.0/token";

            var form = await ctx.Request.ReadFormAsync();
            var formData = new Dictionary<string, string>
            {
                ["client_id"] = cid!,
                ["scope"] = GetScopeString(cid)
            };

            foreach (var field in form)
            {
                if (!OverriddenFields.Contains(field.Key))
                    formData[field.Key] = field.Value.ToString();
            }

            using var httpClient = new HttpClient();
            var response = await httpClient.PostAsync(entraTokenUrl, new FormUrlEncodedContent(formData));
            var responseBody = await response.Content.ReadAsStringAsync();

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
