using BabyChloe.Application.Queries.Diaper;
using BabyChloe.Application.Queries.Feeding;
using BabyChloe.Application.Queries.Sleep;
using MediatR;

namespace BabyChloe.Application.Queries.Dashboard;

public record GetDashboardQuery(Guid BabyId) : IRequest<DashboardResult>;

public record DashboardResult(
    SleepStatisticsResult Sleep,
    FeedingStatisticsResult Feeding,
    DiaperStatisticsResult Diapers,
    ActiveSleepResult? ActiveSleep,
    NextFeedingDueResult NextFeeding);

public class GetDashboardQueryHandler : IRequestHandler<GetDashboardQuery, DashboardResult>
{
    private readonly ISender _mediator;

    public GetDashboardQueryHandler(ISender mediator) => _mediator = mediator;

    public async Task<DashboardResult> Handle(GetDashboardQuery request, CancellationToken cancellationToken)
    {
        var sleepTask = _mediator.Send(new GetSleepStatisticsQuery(request.BabyId, null), cancellationToken);
        var feedingTask = _mediator.Send(new GetFeedingStatisticsQuery(request.BabyId, null), cancellationToken);
        var diaperTask = _mediator.Send(new GetDiaperStatisticsQuery(request.BabyId, null), cancellationToken);
        var activeSleepTask = _mediator.Send(new GetActiveSleepQuery(request.BabyId), cancellationToken);
        var nextFeedingTask = _mediator.Send(new GetNextFeedingDueQuery(request.BabyId), cancellationToken);

        await Task.WhenAll(sleepTask, feedingTask, diaperTask, activeSleepTask, nextFeedingTask);

        return new DashboardResult(
            await sleepTask,
            await feedingTask,
            await diaperTask,
            await activeSleepTask,
            await nextFeedingTask);
    }
}
