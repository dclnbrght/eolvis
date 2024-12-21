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

[Route("api/projects")]
[ApiController]
public class ProjectController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet("")]
    public async Task<ActionResult<IEnumerable<Project>>> GetAllProjects()
    {
        var projects = await _projectService.GetAllProjects();
        
        return Ok(projects);
    }

    [HttpGet("{projectKey}")]
    public async Task<ActionResult<Project>> GetProjectByKey(string projectKey)
    {
        if (projectKey == string.Empty)
        {
            return BadRequest();
        }

        var project = await _projectService.GetProjectByKey(projectKey);

        if (project == null)
        {
            return NotFound();
        }
        
        return Ok(project);
    }
}