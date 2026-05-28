using BabyChloe.Domain.Entities;
using BabyChloe.Domain.Enums;
using BabyChloe.Infrastructure.Persistence;
using MediatR;

namespace BabyChloe.Application.Commands.Feeding;

public record StartFeedingCommand(
    Guid BabyId,
    DateTime StartTime,
    FeedingType Type,
    BreastSide? Side,
    decimal? AmountMl,
    string? Notes,
    Guid RecordedBy) : IRequest<Guid>;

public class StartFeedingCommandHandler : IRequestHandler<StartFeedingCommand, Guid>
{
    private readonly BabyChloeDbContext _context;

    public StartFeedingCommandHandler(BabyChloeDbContext context) => _context = context;

    public async Task<Guid> Handle(StartFeedingCommand request, CancellationToken cancellationToken)
    {
        var feeding = new Domain.Entities.Feeding
        {
            BabyId = request.BabyId,
            StartTime = request.StartTime,
            Type = request.Type,
            Side = request.Side,
            AmountMl = request.AmountMl,
            Notes = request.Notes,
            RecordedBy = request.RecordedBy
        };

        _context.Feedings.Add(feeding);
        await _context.SaveChangesAsync(cancellationToken);
        return feeding.Id;
    }
}
