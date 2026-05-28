using BabyChloe.Domain.Entities;
using BabyChloe.Domain.Enums;
using BabyChloe.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BabyChloe.Application.Commands.Diaper;

public record LogDiaperChangeCommand(
    Guid BabyId,
    DateTime Timestamp,
    DiaperType Type,
    string? Notes,
    Guid RecordedBy) : IRequest<Guid>;

public class LogDiaperChangeCommandHandler : IRequestHandler<LogDiaperChangeCommand, Guid>
{
    private readonly BabyChloeDbContext _context;

    public LogDiaperChangeCommandHandler(BabyChloeDbContext context) => _context = context;

    public async Task<Guid> Handle(LogDiaperChangeCommand request, CancellationToken cancellationToken)
    {
        // Duplicate prevention: no two changes within 60 seconds for same baby
        var recentChange = await _context.DiaperChanges
            .AnyAsync(d => d.BabyId == request.BabyId
                && Math.Abs((d.Timestamp - request.Timestamp).TotalSeconds) < 60, cancellationToken);

        if (recentChange)
            throw new InvalidOperationException("A diaper change was already logged within the last 60 seconds.");

        var change = new DiaperChange
        {
            BabyId = request.BabyId,
            Timestamp = request.Timestamp,
            Type = request.Type,
            Notes = request.Notes,
            RecordedBy = request.RecordedBy
        };

        _context.DiaperChanges.Add(change);
        await _context.SaveChangesAsync(cancellationToken);
        return change.Id;
    }
}
