using BabyChloe.Domain.Entities;
using BabyChloe.Infrastructure.Persistence;
using MediatR;

namespace BabyChloe.Application.Commands.Growth;

public record LogGrowthMeasurementCommand(
    Guid BabyId,
    DateTime MeasuredAt,
    decimal WeightKg,
    decimal? LengthCm,
    decimal? HeadCircumferenceCm,
    string? Notes,
    Guid RecordedBy) : IRequest<Guid>;

public class LogGrowthMeasurementCommandHandler : IRequestHandler<LogGrowthMeasurementCommand, Guid>
{
    private readonly BabyChloeDbContext _context;

    public LogGrowthMeasurementCommandHandler(BabyChloeDbContext context) => _context = context;

    public async Task<Guid> Handle(LogGrowthMeasurementCommand request, CancellationToken cancellationToken)
    {
        var measurement = new GrowthMeasurement
        {
            BabyId = request.BabyId,
            MeasuredAt = request.MeasuredAt,
            WeightKg = request.WeightKg,
            LengthCm = request.LengthCm,
            HeadCircumferenceCm = request.HeadCircumferenceCm,
            Notes = request.Notes,
            RecordedBy = request.RecordedBy
        };

        _context.GrowthMeasurements.Add(measurement);
        await _context.SaveChangesAsync(cancellationToken);
        return measurement.Id;
    }
}
