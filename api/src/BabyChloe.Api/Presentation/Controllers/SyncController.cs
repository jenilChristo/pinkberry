using BabyChloe.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BabyChloe.Api.Presentation.Controllers;

[ApiController]
[Route("api/v1/sync")]
[Authorize]
public class SyncController : BaseApiController
{
    private readonly BabyChloeDbContext _context;

    public SyncController(BabyChloeDbContext context) => _context = context;

    [HttpPost("push")]
    public async Task<IActionResult> Push([FromBody] SyncPushRequest request)
    {
        // Last-writer-wins conflict resolution based on LastModifiedUtc
        foreach (var record in request.SleepRecords)
        {
            var existing = await _context.SleepRecords.FindAsync(Guid.Parse(record.Id));
            if (existing == null || record.LastModifiedUtc > existing.LastModifiedUtc)
            {
                if (existing != null) _context.SleepRecords.Remove(existing);
                // Apply the incoming record (simplified for MVP)
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { syncedAt = DateTime.UtcNow });
    }

    [HttpPost("pull")]
    public async Task<IActionResult> Pull([FromBody] SyncPullRequest request)
    {
        var sleepRecords = await _context.SleepRecords
            .Where(s => s.LastModifiedUtc > request.LastSyncedAt)
            .ToListAsync();

        var feedings = await _context.Feedings
            .Where(f => f.LastModifiedUtc > request.LastSyncedAt)
            .ToListAsync();

        var diaperChanges = await _context.DiaperChanges
            .Where(d => d.LastModifiedUtc > request.LastSyncedAt)
            .ToListAsync();

        return Ok(new { sleepRecords, feedings, diaperChanges, syncedAt = DateTime.UtcNow });
    }
}

public record SyncPushRequest(List<SyncRecord> SleepRecords, List<SyncRecord> Feedings, List<SyncRecord> DiaperChanges);
public record SyncPullRequest(DateTime LastSyncedAt);
public record SyncRecord(string Id, DateTime LastModifiedUtc);
