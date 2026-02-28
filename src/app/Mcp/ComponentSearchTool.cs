using System.ComponentModel;
using System.Text.Json;
using Eolvis.App.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using ModelContextProtocol.Server;

using Component = Eolvis.App.Models.Component;

namespace Eolvis.App.Mcp;

public class ComponentSearchTool
{
    [McpServerTool, Description("Search EOL components by name (partial, case-insensitive match) and version (optional). Returns component lifecycle data including supported dates, versions, and EOL status.")]
    public static async Task<string> SearchComponents(
        IComponentService componentService,
        IHttpContextAccessor httpContextAccessor,
        [Description("Partial component name to search for (e.g. '.NET' or 'React')")] string name,
        [Description("The project key. Optional if X-Project-Key header is set.")] string? projectKey = null,
        [Description("Optional partial version to filter by (e.g. '8' or '18.2')")] string? version = null)
    {
        // Fall back to X-Project-Key header if not provided as a parameter
        projectKey ??= httpContextAccessor.HttpContext?.Request.Headers["X-Project-Key"].ToString();

        if (string.IsNullOrWhiteSpace(projectKey))
            return "Error: projectKey is required. Pass it as a parameter or set the X-Project-Key header in your MCP server config.";

        List<Component> results;

        if (!string.IsNullOrWhiteSpace(version))
            results = await componentService.SearchComponentsByNameAndVersion(projectKey, name, version);
        else
            results = await componentService.SearchComponentsByName(projectKey, name);

        if (results.Count == 0)
            return $"No components found matching name '{name}'" + (version != null ? $" and version '{version}'" : "") + $" in project '{projectKey}'.";

        return JsonSerializer.Serialize(results, new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
    }
}
