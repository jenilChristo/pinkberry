using BabyChloe.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BabyChloe.Application.Queries.Sleep;

public record GetActiveSleepQuery(Guid BabyId) : IRequest<ActiveSleepResult?>;

public record ActiveSleepResult(Guid Id, DateTime StartTime, string Quality, string Location);

public class GetActiveSleepQueryHandler : IRequestHandler<GetActiveSleepQuery, ActiveSleepResult?>
{
    private readonly BabyChloeDbContext _context;

    public GetActiveSleepQueryHandler(BabyChloeDbContext context) => _context = context;

    public async Task<ActiveSleepResult?> Handle(GetActiveSleepQuery request, CancellationToken cancellationToken)
    {
        var record = await _context.SleepRecords
            .FirstOrDefaultAsync(s => s.BabyId == request.BabyId && s.EndTime == null, cancellationToken);

        return record == null ? null : new ActiveSleepResult(
            record.Id, record.StartTime, record.Quality.ToString(), record.Location.ToString());
    }
}
