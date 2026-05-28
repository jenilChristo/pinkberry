using BabyChloe.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BabyChloe.Application.Commands.Feeding;

public record EndFeedingCommand(Guid Id, DateTime EndTime) : IRequest<EndFeedingResult>;

public record EndFeedingResult(Guid Id, DateTime StartTime, DateTime EndTime, TimeSpan Duration);

public class EndFeedingCommandHandler : IRequestHandler<EndFeedingCommand, EndFeedingResult>
{
    private readonly BabyChloeDbContext _context;

    public EndFeedingCommandHandler(BabyChloeDbContext context) => _context = context;

    public async Task<EndFeedingResult> Handle(EndFeedingCommand request, CancellationToken cancellationToken)
    {
        var feeding = await _context.Feedings
            .FirstOrDefaultAsync(f => f.Id == request.Id && f.EndTime == null, cancellationToken)
            ?? throw new KeyNotFoundException($"Active feeding {request.Id} not found");

        feeding.EndTime = request.EndTime;
        await _context.SaveChangesAsync(cancellationToken);
        var duration = feeding.EndTime.Value - feeding.StartTime;
        return new EndFeedingResult(feeding.Id, feeding.StartTime, feeding.EndTime.Value, duration);
    }
}
