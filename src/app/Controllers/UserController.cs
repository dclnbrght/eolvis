using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using Eolvis.App.Models;
using Eolvis.App.Services;
using Eolvis.App.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Eolvis.App.Controllers;

[Route("api/user")]
[ApiController]
public class UserController : ControllerBase
{    
    private readonly IUserProfileService _userProfileService;
    private readonly ILogger<UserController> _logger;

    public UserController(IUserProfileService userProfileService, ILogger<UserController> logger)
    {
        _userProfileService = userProfileService;
        _logger = logger;
    }

    [HttpGet("profile")]
    public async Task<ActionResult<UserProfile>> GetUserProfile()
    {        
        var userName = User?.Identity?.Name ?? Environment.UserName ?? "eolvis";

        var userProfile = await _userProfileService.GetUserProfile(userName);

        if (userProfile == null)
        {
            return NotFound();
        }
        
        return Ok(userProfile);
    }
}