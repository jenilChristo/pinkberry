using BabyChloe.Application.Commands.Sleep;
using BabyChloe.Application.Queries.Sleep;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BabyChloe.Api.Presentation.Controllers;

[ApiController]
[Route("api/v1/babies/{babyId:guid}/sleep")]
[Authorize]
public class SleepController : BaseApiController
{
    [HttpPost]
    public async Task<IActionResult> Start(Guid babyId, [FromBody] StartSleepRequest request)
    {
        var id = await Mediator.Send(new StartSleepCommand(
            babyId, request.StartTime, request.Quality, request.Location,
            request.WasSwaddled, request.Notes, GetCaregiverId()));
        return CreatedAtAction(nameof(GetActive), new { babyId }, new { id });
    }

    [HttpPut("{id:guid}/end")]
    public async Task<IActionResult> End(Guid babyId, Guid id, [FromBody] EndSleepRequest request)
    {
        var result = await Mediator.Send(new EndSleepCommand(id, request.EndTime, request.Quality));
        return Ok(result);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActive(Guid babyId)
    {
        var result = await Mediator.Send(new GetActiveSleepQuery(babyId));
        return result != null ? Ok(result) : NoContent();
    }

    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics(Guid babyId, [FromQuery] DateTime? date)
    {
        var result = await Mediator.Send(new GetSleepStatisticsQuery(babyId, date));
        return Ok(result);
    }
}

public record StartSleepRequest(DateTime StartTime, Domain.Enums.SleepQuality Quality, Domain.Enums.SleepLocation Location, bool WasSwaddled, string? Notes);
public record EndSleepRequest(DateTime EndTime, Domain.Enums.SleepQuality? Quality);
