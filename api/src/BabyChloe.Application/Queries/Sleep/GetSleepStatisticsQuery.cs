using BabyChloe.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BabyChloe.Application.Queries.Sleep;

public record GetSleepStatisticsQuery(Guid BabyId, DateTime? Date) : IRequest<SleepStatisticsResult>;

public record SleepStatisticsResult(
    TimeSpan TotalSleepToday,
    int SessionCount,
    TimeSpan? AverageSessionDuration,
    string InsightMessage);

public class GetSleepStatisticsQueryHandler : IRequestHandler<GetSleepStatisticsQuery, SleepStatisticsResult>
{
    private readonly BabyChloeDbContext _context;

    public GetSleepStatisticsQueryHandler(BabyChloeDbContext context) => _context = context;

    public async Task<SleepStatisticsResult> Handle(GetSleepStatisticsQuery request, CancellationToken cancellationToken)
    {
        var date = request.Date ?? DateTime.UtcNow.Date;
        var records = await _context.SleepRecords
            .Where(s => s.BabyId == request.BabyId && s.StartTime.Date == date && s.EndTime != null)
            .ToListAsync(cancellationToken);

        var totalSleep = records.Aggregate(TimeSpan.Zero, (sum, r) => sum + (r.EndTime!.Value - r.StartTime));
        var avgDuration = records.Count > 0
            ? TimeSpan.FromTicks(totalSleep.Ticks / records.Count)
            : (TimeSpan?)null;

        var insight = totalSleep.TotalHours switch
        {
            >= 14 => "What a great sleeper! Your little one is resting beautifully today! 🌙",
            >= 10 => "Good sleep day! Your baby is getting the rest they need. 💤",
            >= 6 => "Hang in there! Every nap counts towards a good day. ✨",
            _ => "It's been a busy day! Sweet dreams are coming soon. 🌟"
        };

        return new SleepStatisticsResult(totalSleep, records.Count, avgDuration, insight);
    }
}
