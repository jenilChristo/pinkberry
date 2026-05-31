using BabyChloe.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BabyChloe.Application.Queries.Activity;

public record GetActivityFeedQuery(Guid BabyId, int Page = 1, int PageSize = 20) : IRequest<ActivityFeedResult>;

public record ActivityFeedItem(string Type, DateTime Timestamp, string Description, string CaregiverName);
public record ActivityFeedResult(List<ActivityFeedItem> Items, int TotalCount);

public class GetActivityFeedQueryHandler : IRequestHandler<GetActivityFeedQuery, ActivityFeedResult>
{
    private readonly BabyChloeDbContext _context;

    public GetActivityFeedQueryHandler(BabyChloeDbContext context) => _context = context;

    public async Task<ActivityFeedResult> Handle(GetActivityFeedQuery request, CancellationToken cancellationToken)
    {
        var activities = new List<ActivityFeedItem>();

        var sleepRecords = await _context.SleepRecords
            .Where(s => s.BabyId == request.BabyId)
            .OrderByDescending(s => s.StartTime)
            .Take(50)
            .ToListAsync(cancellationToken);

        var feedingRecords = await _context.Feedings
            .Where(f => f.BabyId == request.BabyId)
            .OrderByDescending(f => f.StartTime)
            .Take(50)
            .ToListAsync(cancellationToken);

        var diaperRecords = await _context.DiaperChanges
            .Where(d => d.BabyId == request.BabyId)
            .OrderByDescending(d => d.Timestamp)
            .Take(50)
            .ToListAsync(cancellationToken);

        // Get all unique caregiver IDs and load them in a single query
        var caregiverIds = new HashSet<Guid>();
        caregiverIds.UnionWith(sleepRecords.Select(s => s.RecordedBy));
        caregiverIds.UnionWith(feedingRecords.Select(f => f.RecordedBy));
        caregiverIds.UnionWith(diaperRecords.Select(d => d.RecordedBy));

        var caregivers = await _context.Caregivers
            .Where(c => caregiverIds.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, c => c.DisplayName, cancellationToken);

        activities.AddRange(sleepRecords.Select(s => new ActivityFeedItem(
            "Sleep",
            s.StartTime,
            s.EndTime.HasValue
                ? $"Slept for {(s.EndTime.Value - s.StartTime):h\\:mm} ({s.Quality})"
                : $"Started sleeping ({s.Location})",
            caregivers.GetValueOrDefault(s.RecordedBy, "Unknown"))));

        activities.AddRange(feedingRecords.Select(f => new ActivityFeedItem(
            "Feeding",
            f.StartTime,
            f.EndTime.HasValue
                ? $"{f.Type} feeding for {(f.EndTime.Value - f.StartTime):m\\:ss}"
                : $"Started {f.Type} feeding",
            caregivers.GetValueOrDefault(f.RecordedBy, "Unknown"))));

        activities.AddRange(diaperRecords.Select(d => new ActivityFeedItem(
            "Diaper",
            d.Timestamp,
            $"{d.Type} diaper change",
            caregivers.GetValueOrDefault(d.RecordedBy, "Unknown"))));

        var sorted = activities.OrderByDescending(a => a.Timestamp).ToList();
        var paged = sorted.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToList();

        return new ActivityFeedResult(paged, sorted.Count);
    }
}
