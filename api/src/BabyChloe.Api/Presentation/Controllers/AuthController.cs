using BabyChloe.Api.Middleware;
using BabyChloe.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BabyChloe.Api.Presentation.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly BabyChloeDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(BabyChloeDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // For MVP, simplified auth - find or create caregiver by provider ID
        var caregiver = await _context.Caregivers
            .FirstOrDefaultAsync(c => c.AuthProvider == request.Provider && c.AuthProviderId == request.IdToken);

        if (caregiver == null)
        {
            caregiver = new Domain.Entities.Caregiver
            {
                DisplayName = "New User",
                AuthProvider = request.Provider,
                AuthProviderId = request.IdToken
            };
            _context.Caregivers.Add(caregiver);
            await _context.SaveChangesAsync();
        }

        var token = AuthMiddleware.GenerateToken(_configuration, caregiver.Id, caregiver.DisplayName);
        var refreshToken = Guid.NewGuid().ToString("N");

        return Ok(new
        {
            accessToken = token,
            refreshToken,
            expiresIn = 3600,
            caregiver = new { caregiver.Id, caregiver.DisplayName }
        });
    }

    [HttpPost("refresh")]
    public IActionResult Refresh([FromBody] RefreshRequest request)
    {
        // Simplified refresh for MVP
        return Ok(new
        {
            accessToken = "refreshed-token",
            refreshToken = Guid.NewGuid().ToString("N"),
            expiresIn = 3600
        });
    }
}

public record LoginRequest(string Provider, string IdToken);
public record RefreshRequest(string RefreshToken);
