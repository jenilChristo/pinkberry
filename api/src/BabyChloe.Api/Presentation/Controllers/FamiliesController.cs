using BabyChloe.Domain.Entities;
using BabyChloe.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BabyChloe.Api.Presentation.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class FamiliesController : ControllerBase
{
    private readonly BabyChloeDbContext _context;

    public FamiliesController(BabyChloeDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateFamilyRequest request)
    {
        var family = new Family { Name = request.Name };
        _context.Families.Add(family);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = family.Id }, family);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var family = await _context.Families
            .Include(f => f.Babies)
            .Include(f => f.Members)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (family == null) return NotFound();
        return Ok(family);
    }

    [HttpPost("{id:guid}/join")]
    public async Task<IActionResult> Join(Guid id, [FromBody] JoinFamilyRequest request)
    {
        var family = await _context.Families.FirstOrDefaultAsync(f => f.InviteCode == request.InviteCode);
        if (family == null) return NotFound("Invalid invite code");

        var membership = new FamilyMembership
        {
            FamilyId = family.Id,
            CaregiverId = request.CaregiverId,
            Role = Domain.Enums.CaregiverRole.Secondary
        };

        _context.FamilyMemberships.Add(membership);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Joined family successfully" });
    }
}

public record CreateFamilyRequest(string Name);
public record JoinFamilyRequest(string InviteCode, Guid CaregiverId);
