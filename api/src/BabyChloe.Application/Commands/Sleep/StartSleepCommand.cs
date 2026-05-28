using BabyChloe.Domain.Entities;
using BabyChloe.Domain.Enums;
using BabyChloe.Infrastructure.Persistence;
using MediatR;

namespace BabyChloe.Application.Commands.Sleep;

public record StartSleepCommand(
    Guid BabyId,
    DateTime StartTime,
    SleepQuality Quality,
    SleepLocation Location,
    bool WasSwaddled,
    string? Notes,
    Guid RecordedBy) : IRequest<Guid>;

public class StartSleepCommandHandler : IRequestHandler<StartSleepCommand, Guid>
{
    private readonly BabyChloeDbContext _context;

    public StartSleepCommandHandler(BabyChloeDbContext context) => _context = context;

    public async Task<Guid> Handle(StartSleepCommand request, CancellationToken cancellationToken)
    {
        var record = new SleepRecord
        {
            BabyId = request.BabyId,
            StartTime = request.StartTime,
            Quality = request.Quality,
            Location = request.Location,
            WasSwaddled = request.WasSwaddled,
            Notes = request.Notes,
            RecordedBy = request.RecordedBy
        };

        _context.SleepRecords.Add(record);
        await _context.SaveChangesAsync(cancellationToken);
        return record.Id;
    }
}
