using BabyChloe.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BabyChloe.Application.Queries.Growth;

public record GetGrowthChartQuery(Guid BabyId) : IRequest<GrowthChartResult>;

public record GrowthChartDataPoint(DateTime Date, decimal Value, decimal? Percentile);
public record GrowthChartResult(
    List<GrowthChartDataPoint> WeightData,
    List<GrowthChartDataPoint> LengthData,
    List<GrowthChartDataPoint> HeadData);

public class GetGrowthChartQueryHandler : IRequestHandler<GetGrowthChartQuery, GrowthChartResult>
{
    private readonly BabyChloeDbContext _context;

    public GetGrowthChartQueryHandler(BabyChloeDbContext context) => _context = context;

    public async Task<GrowthChartResult> Handle(GetGrowthChartQuery request, CancellationToken cancellationToken)
    {
        var measurements = await _context.GrowthMeasurements
            .Where(g => g.BabyId == request.BabyId)
            .OrderBy(g => g.MeasuredAt)
            .ToListAsync(cancellationToken);

        var weightData = measurements.Select(m => new GrowthChartDataPoint(m.MeasuredAt, m.WeightKg, null)).ToList();
        var lengthData = measurements.Where(m => m.LengthCm.HasValue)
            .Select(m => new GrowthChartDataPoint(m.MeasuredAt, m.LengthCm!.Value, null)).ToList();
        var headData = measurements.Where(m => m.HeadCircumferenceCm.HasValue)
            .Select(m => new GrowthChartDataPoint(m.MeasuredAt, m.HeadCircumferenceCm!.Value, null)).ToList();

        return new GrowthChartResult(weightData, lengthData, headData);
    }
}
