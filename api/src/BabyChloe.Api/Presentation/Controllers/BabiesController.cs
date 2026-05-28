using BabyChloe.Domain.Entities;
using BabyChloe.Domain.Enums;
using BabyChloe.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BabyChloe.Api.Presentation.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class BabiesController : ControllerBase
{
    private readonly BabyChloeDbContext _context;

    public BabiesController(BabyChloeDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBabyRequest request)
    {
        var baby = new Baby
        {
            Name = request.Name,
            BirthDate = request.BirthDate,
            Gender = request.Gender,
            BirthWeightKg = request.BirthWeightKg,
            BirthLengthCm = request.BirthLengthCm,
            FamilyId = request.FamilyId
        };

        _context.Babies.Add(baby);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = baby.Id }, baby);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var baby = await _context.Babies.FindAsync(id);
        if (baby == null) return NotFound();
        return Ok(baby);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBabyRequest request)
    {
        var baby = await _context.Babies.FindAsync(id);
        if (baby == null) return NotFound();

        if (request.Name != null) baby.Name = request.Name;
        if (request.PhotoUrl != null) baby.PhotoUrl = request.PhotoUrl;

        await _context.SaveChangesAsync();
        return Ok(baby);
    }

    [HttpGet("family/{familyId:guid}")]
    public async Task<IActionResult> GetByFamily(Guid familyId)
    {
        var babies = await _context.Babies
            .Where(b => b.FamilyId == familyId)
            .ToListAsync();
        return Ok(babies);
    }
}

public record CreateBabyRequest(string Name, DateTime BirthDate, Gender Gender, decimal BirthWeightKg, decimal BirthLengthCm, Guid FamilyId);
public record UpdateBabyRequest(string? Name, string? PhotoUrl);
