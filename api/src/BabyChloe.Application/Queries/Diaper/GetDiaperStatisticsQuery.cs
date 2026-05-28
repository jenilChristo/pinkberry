using BabyChloe.Domain.Enums;
using BabyChloe.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BabyChloe.Application.Queries.Diaper;

public record GetDiaperStatisticsQuery(Guid BabyId, DateTime? Date) : IRequest<DiaperStatisticsResult>;

public record DiaperStatisticsResult(
    int TotalToday,
    int WetCount,
    int SoiledCount,
    int BothCount,
    string HealthStatus,
    string InsightMessage);

public class GetDiaperStatisticsQueryHandler : IRequestHandler<GetDiaperStatisticsQuery, DiaperStatisticsResult>
{
    private readonly BabyChloeDbContext _context;

    public GetDiaperStatisticsQueryHandler(BabyChloeDbContext context) => _context = context;

    public async Task<DiaperStatisticsResult> Handle(GetDiaperStatisticsQuery request, CancellationToken cancellationToken)
    {
        var date = request.Date ?? DateTime.UtcNow.Date;
        var changes = await _context.DiaperChanges
            .Where(d => d.BabyId == request.BabyId && d.Timestamp.Date == date)
            .ToListAsync(cancellationToken);

        var wetCount = changes.Count(d => d.Type == DiaperType.Wet || d.Type == DiaperType.Both);
        var soiledCount = changes.Count(d => d.Type == DiaperType.Soiled || d.Type == DiaperType.Both);
        var bothCount = changes.Count(d => d.Type == DiaperType.Both);

        var (healthStatus, insight) = wetCount switch
        {
            >= 8 => ("Healthy", "Great hydration today! 💧 Your baby is well-hydrated."),
            >= 5 => ("Advisory", "Good day so far! Keep up the feedings. 🌟"),
            _ => ("Concern", "A bit below typical today. Keep offering feeds and check in with your pediatrician if concerned. 💕")
        };

        return new DiaperStatisticsResult(changes.Count, wetCount, soiledCount, bothCount, healthStatus, insight);
    }
}
