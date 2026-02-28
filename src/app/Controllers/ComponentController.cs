using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Eolvis.App.Models;
using Eolvis.App.Services;
using Eolvis.App.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Eolvis.App.Controllers;

[Authorize]
[Route("api/projects/{projectKey}/components")]
[ApiController]
public class ComponentController : ControllerBase
{
    private readonly IComponentService _componentService;
    private readonly ILogger<ComponentController> _logger;

    public ComponentController(IComponentService componentService, ILogger<ComponentController> logger)
    {
        _componentService = componentService;
        _logger = logger;
    }

    [HttpGet("")]
    public async Task<ActionResult<IEnumerable<Component>>> GetAllComponents(string projectKey)
    {
        var components = await _componentService.GetAllComponents(projectKey);

        return Ok(components);
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<Component>>> SearchComponents(string projectKey, [FromQuery] string name, [FromQuery] string? version = null)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(ErrorResponse.BadRequest("The 'name' query parameter is required.", HttpContext.TraceIdentifier));
        }

        List<Component> components;

        if (!string.IsNullOrWhiteSpace(version))
        {
            components = await _componentService.SearchComponentsByNameAndVersion(projectKey, name, version);
        }
        else
        {
            components = await _componentService.SearchComponentsByName(projectKey, name);
        }

        return Ok(components);
    }

    [HttpGet("{componentId}")]
    public async Task<ActionResult<Component>> GetComponentById(string projectKey, Guid componentId)
    {
        var component = await _componentService.GetComponentById(projectKey, componentId);

        if (component == null)
        {
            return NotFound();
        }

        return Ok(component);
    }

    [HttpGet("{componentId}/commands")]
    public async Task<ActionResult<List<ComponentCommand>>> GetComponentCommandsById(string projectKey, Guid componentId)
    {
        var commands = await _componentService.GetComponentCommandsById(projectKey, componentId);

        if (commands == null)
        {
            return NotFound();
        }

        return Ok(commands);
    }

    [HttpPost("")]
    public async Task<ActionResult<Component>> CreateComponents(string projectKey, [FromBody] List<Component> components)
    {
        try
        {
            foreach (var component in components)
            {
                await _componentService.InsertCommand(projectKey, component, getUsername());
            }

            return Ok(components);
        }
        catch (UnauthorizedAccessException uaex) 
        {
            _logger.LogWarning(uaex, "Unauthorized attempt to create components by {User}", getUsername());
            return Unauthorized(ErrorResponse.Unauthorized(uaex.Message, HttpContext.TraceIdentifier));
        }
        catch (ArgumentException aex)
        {
            return BadRequest(ErrorResponse.BadRequest(aex.Message, HttpContext.TraceIdentifier));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating components for project {ProjectKey}", projectKey);
            return StatusCode(500, ErrorResponse.InternalError(HttpContext.TraceIdentifier));
        }
    }

    [HttpPut("{componentId}")]
    public async Task<ActionResult<Component>> UpdateComponent(string projectKey, Guid componentId, [FromBody] Component component)
    {
        try
        {
            if (componentId.ToString() != component.RowKey)
            {
                return BadRequest("The componentId parameter and id values must match");
            }

            await _componentService.UpdateCommand(projectKey, component, getUsername());

            return Ok(component);
        }
        catch (UnauthorizedAccessException uaex) 
        {
            _logger.LogWarning(uaex, "Unauthorized attempt to update component {ComponentId} by {User}", componentId, getUsername());
            return Unauthorized(ErrorResponse.Unauthorized(uaex.Message, HttpContext.TraceIdentifier));
        }
        catch (ArgumentException aex)
        {
            return BadRequest(ErrorResponse.BadRequest(aex.Message, HttpContext.TraceIdentifier));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating component {ComponentId} in project {ProjectKey}", componentId, projectKey);
            return StatusCode(500, ErrorResponse.InternalError(HttpContext.TraceIdentifier));
        }
    }

    [HttpDelete("{componentId}")]
    public async Task<ActionResult> DeleteComponent(string projectKey, Guid componentId)
    {
        try
        {
            await _componentService.DeleteCommand(projectKey, componentId, getUsername());

            return Ok("deleted");
        }
        catch (UnauthorizedAccessException uaex) 
        {
            _logger.LogWarning(uaex, "Unauthorized attempt to delete component {ComponentId} by {User}", componentId, getUsername());
            return Unauthorized(ErrorResponse.Unauthorized(uaex.Message, HttpContext.TraceIdentifier));
        }
        catch (ArgumentException aex)
        {
            return BadRequest(ErrorResponse.BadRequest(aex.Message, HttpContext.TraceIdentifier));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting component {ComponentId} in project {ProjectKey}", componentId, projectKey);
            return StatusCode(500, ErrorResponse.InternalError(HttpContext.TraceIdentifier));
        }
    }

    private string getUsername() {
        return User?.Identity?.Name ?? Environment.UserName ?? "eolvis";
    }
}