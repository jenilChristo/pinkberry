using BabyChloe.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BabyChloe.Application.Queries.Feeding;

public record GetFeedingStatisticsQuery(Guid BabyId, DateTime? Date) : IRequest<FeedingStatisticsResult>;

public record FeedingStatisticsResult(
    int TotalFeedingsToday,
    TimeSpan TotalFeedingTime,
    TimeSpan? AverageDuration,
    string? LastSide,
    string InsightMessage);

public class GetFeedingStatisticsQueryHandler : IRequestHandler<GetFeedingStatisticsQuery, FeedingStatisticsResult>
{
    private readonly BabyChloeDbContext _context;

    public GetFeedingStatisticsQueryHandler(BabyChloeDbContext context) => _context = context;

    public async Task<FeedingStatisticsResult> Handle(GetFeedingStatisticsQuery request, CancellationToken cancellationToken)
    {
        var date = request.Date ?? DateTime.UtcNow.Date;
        var feedings = await _context.Feedings
            .Where(f => f.BabyId == request.BabyId && f.StartTime.Date == date && f.EndTime != null)
            .OrderByDescending(f => f.StartTime)
            .ToListAsync(cancellationToken);

        var totalTime = feedings.Aggregate(TimeSpan.Zero, (sum, f) => sum + (f.EndTime!.Value - f.StartTime));
        var avgDuration = feedings.Count > 0 ? TimeSpan.FromTicks(totalTime.Ticks / feedings.Count) : (TimeSpan?)null;
        var lastSide = feedings.FirstOrDefault()?.Side?.ToString();

        var insight = feedings.Count switch
        {
            >= 8 => "Your little one has a healthy appetite today! Great feeding day! 🍼",
            >= 5 => "Good feeding rhythm! You're doing wonderfully. 💕",
            >= 3 => "Feedings are going well. Every drop counts! ✨",
            _ => "Just getting started today. You've got this! 🌟"
        };

        return new FeedingStatisticsResult(feedings.Count, totalTime, avgDuration, lastSide, insight);
    }
}
