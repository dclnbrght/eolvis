using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Eolvis.App.Models;
using Eolvis.App.Services;
using Eolvis.App.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Eolvis.App.Controllers;

[Route("api/projects/{projectKey}/components")]
[ApiController]
public class ComponentController : ControllerBase
{
    private readonly IComponentService _componentService;

    public ComponentController(IComponentService componentService)
    {
        _componentService = componentService;
    }

    [HttpGet("")]
    public async Task<ActionResult<IEnumerable<Component>>> GetAllComponents(string projectKey)
    {
        var components = await _componentService.GetAllComponents(projectKey);

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
            return Unauthorized(uaex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
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
            return Unauthorized(uaex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
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
            return Unauthorized(uaex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    private string getUsername() {
        return User?.Identity?.Name ?? Environment.UserName ?? "eolvis";
    }
}