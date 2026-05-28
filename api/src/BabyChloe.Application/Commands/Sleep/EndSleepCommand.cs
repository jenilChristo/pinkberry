using BabyChloe.Domain.Enums;
using BabyChloe.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BabyChloe.Application.Commands.Sleep;

public record EndSleepCommand(Guid Id, DateTime EndTime, SleepQuality? Quality) : IRequest<EndSleepResult>;

public record EndSleepResult(Guid Id, DateTime StartTime, DateTime EndTime, TimeSpan Duration);

public class EndSleepCommandHandler : IRequestHandler<EndSleepCommand, EndSleepResult>
{
    private readonly BabyChloeDbContext _context;

    public EndSleepCommandHandler(BabyChloeDbContext context) => _context = context;

    public async Task<EndSleepResult> Handle(EndSleepCommand request, CancellationToken cancellationToken)
    {
        var record = await _context.SleepRecords
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.EndTime == null, cancellationToken)
            ?? throw new KeyNotFoundException($"Active sleep record {request.Id} not found");

        record.EndTime = request.EndTime;
        if (request.Quality.HasValue) record.Quality = request.Quality.Value;

        await _context.SaveChangesAsync(cancellationToken);
        var duration = record.EndTime.Value - record.StartTime;
        return new EndSleepResult(record.Id, record.StartTime, record.EndTime.Value, duration);
    }
}
