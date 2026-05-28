using BabyChloe.Application.Commands.Feeding;
using BabyChloe.Application.Queries.Feeding;
using BabyChloe.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BabyChloe.Api.Presentation.Controllers;

[ApiController]
[Route("api/v1/babies/{babyId:guid}/feedings")]
[Authorize]
public class FeedingsController : BaseApiController
{
    [HttpPost]
    public async Task<IActionResult> Start(Guid babyId, [FromBody] StartFeedingRequest request)
    {
        var id = await Mediator.Send(new StartFeedingCommand(
            babyId, request.StartTime, request.Type, request.Side,
            request.AmountMl, request.Notes, GetCaregiverId()));
        return CreatedAtAction(nameof(GetStatistics), new { babyId }, new { id });
    }

    [HttpPut("{id:guid}/end")]
    public async Task<IActionResult> End(Guid babyId, Guid id, [FromBody] EndFeedingRequest request)
    {
        var result = await Mediator.Send(new EndFeedingCommand(id, request.EndTime));
        return Ok(result);
    }

    [HttpGet("next-due")]
    public async Task<IActionResult> GetNextDue(Guid babyId)
    {
        var result = await Mediator.Send(new GetNextFeedingDueQuery(babyId));
        return Ok(result);
    }

    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics(Guid babyId, [FromQuery] DateTime? date)
    {
        var result = await Mediator.Send(new GetFeedingStatisticsQuery(babyId, date));
        return Ok(result);
    }
}

public record StartFeedingRequest(DateTime StartTime, FeedingType Type, BreastSide? Side, decimal? AmountMl, string? Notes);
public record EndFeedingRequest(DateTime EndTime);
