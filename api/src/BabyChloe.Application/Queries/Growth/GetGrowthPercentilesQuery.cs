using BabyChloe.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BabyChloe.Application.Queries.Growth;

public record GetGrowthPercentilesQuery(Guid BabyId) : IRequest<GrowthPercentilesResult>;

public record GrowthPercentilesResult(
    decimal? WeightPercentile,
    decimal? LengthPercentile,
    decimal? HeadPercentile,
    string InsightMessage);

public class GetGrowthPercentilesQueryHandler : IRequestHandler<GetGrowthPercentilesQuery, GrowthPercentilesResult>
{
    private readonly BabyChloeDbContext _context;

    public GetGrowthPercentilesQueryHandler(BabyChloeDbContext context) => _context = context;

    public async Task<GrowthPercentilesResult> Handle(GetGrowthPercentilesQuery request, CancellationToken cancellationToken)
    {
        var latest = await _context.GrowthMeasurements
            .Where(g => g.BabyId == request.BabyId)
            .OrderByDescending(g => g.MeasuredAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (latest == null)
            return new GrowthPercentilesResult(null, null, null, "No measurements yet. Add your first one! 📏");

        var baby = await _context.Babies.FindAsync(new object[] { request.BabyId }, cancellationToken);
        if (baby == null)
            throw new KeyNotFoundException("Baby not found");

        // Simplified percentile calculation (WHO LMS method placeholder)
        var ageInDays = (latest.MeasuredAt - baby.BirthDate).TotalDays;
        var weightPercentile = CalculateSimplifiedPercentile(latest.WeightKg, ageInDays, "weight");
        var lengthPercentile = latest.LengthCm.HasValue
            ? CalculateSimplifiedPercentile(latest.LengthCm.Value, ageInDays, "length")
            : (decimal?)null;
        var headPercentile = latest.HeadCircumferenceCm.HasValue
            ? CalculateSimplifiedPercentile(latest.HeadCircumferenceCm.Value, ageInDays, "head")
            : (decimal?)null;

        var insight = weightPercentile switch
        {
            >= 75 => "Your baby is growing beautifully! Strong and healthy! 💪",
            >= 25 => "Right on track! Your little one is growing perfectly. 🌱",
            _ => "Every baby grows at their own pace. You're doing great! 💕"
        };

        return new GrowthPercentilesResult(weightPercentile, lengthPercentile, headPercentile, insight);
    }

    private static decimal CalculateSimplifiedPercentile(decimal value, double ageInDays, string type)
    {
        // Simplified percentile - in production this would use WHO LMS tables
        // This provides a reasonable approximation for MVP
        return type switch
        {
            "weight" => Math.Clamp((decimal)(50 + (double)value * 5 - ageInDays * 0.01), 1, 99),
            "length" => Math.Clamp((decimal)(50 + (double)value * 0.5 - ageInDays * 0.005), 1, 99),
            "head" => Math.Clamp((decimal)(50 + (double)value * 1.0 - ageInDays * 0.005), 1, 99),
            _ => 50
        };
    }
}
