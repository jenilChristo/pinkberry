using BabyChloe.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BabyChloe.Application.Queries.Feeding;

public record GetNextFeedingDueQuery(Guid BabyId) : IRequest<NextFeedingDueResult>;

public record NextFeedingDueResult(DateTime NextDueAt, int AverageIntervalMinutes, TimeSpan TimeUntilDue);

public class GetNextFeedingDueQueryHandler : IRequestHandler<GetNextFeedingDueQuery, NextFeedingDueResult>
{
    private readonly BabyChloeDbContext _context;

    public GetNextFeedingDueQueryHandler(BabyChloeDbContext context) => _context = context;

    public async Task<NextFeedingDueResult> Handle(GetNextFeedingDueQuery request, CancellationToken cancellationToken)
    {
        var recentFeedings = await _context.Feedings
            .Where(f => f.BabyId == request.BabyId && f.EndTime != null)
            .OrderByDescending(f => f.StartTime)
            .Take(7)
            .ToListAsync(cancellationToken);

        if (recentFeedings.Count < 2)
        {
            var defaultInterval = TimeSpan.FromHours(3);
            var lastFeeding = recentFeedings.FirstOrDefault();
            var nextDue = (lastFeeding?.EndTime ?? DateTime.UtcNow) + defaultInterval;
            return new NextFeedingDueResult(nextDue, (int)defaultInterval.TotalMinutes, nextDue - DateTime.UtcNow);
        }

        // Calculate weighted rolling average interval
        var intervals = new List<double>();
        for (int i = 0; i < recentFeedings.Count - 1; i++)
        {
            var interval = (recentFeedings[i].StartTime - recentFeedings[i + 1].StartTime).TotalMinutes;
            intervals.Add(interval);
        }

        // Weight more recent intervals higher
        var weightedSum = 0.0;
        var weightTotal = 0.0;
        for (int i = 0; i < intervals.Count; i++)
        {
            var weight = intervals.Count - i; // Most recent gets highest weight
            weightedSum += intervals[i] * weight;
            weightTotal += weight;
        }

        var avgMinutes = (int)(weightedSum / weightTotal);
        var nextDueTime = recentFeedings[0].StartTime.AddMinutes(avgMinutes);
        var timeUntilDue = nextDueTime - DateTime.UtcNow;

        return new NextFeedingDueResult(nextDueTime, avgMinutes, timeUntilDue);
    }
}
