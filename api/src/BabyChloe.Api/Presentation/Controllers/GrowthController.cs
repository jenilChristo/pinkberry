using BabyChloe.Application.Commands.Growth;
using BabyChloe.Application.Queries.Growth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BabyChloe.Api.Presentation.Controllers;

[ApiController]
[Route("api/v1/babies/{babyId:guid}/growth")]
[Authorize]
public class GrowthController : BaseApiController
{
    [HttpPost]
    public async Task<IActionResult> Log(Guid babyId, [FromBody] LogGrowthRequest request)
    {
        var id = await Mediator.Send(new LogGrowthMeasurementCommand(
            babyId, request.MeasuredAt, request.WeightKg, request.LengthCm,
            request.HeadCircumferenceCm, request.Notes, GetCaregiverId()));
        return CreatedAtAction(nameof(GetPercentiles), new { babyId }, new { id });
    }

    [HttpGet("percentiles")]
    public async Task<IActionResult> GetPercentiles(Guid babyId)
    {
        var result = await Mediator.Send(new GetGrowthPercentilesQuery(babyId));
        return Ok(result);
    }

    [HttpGet("chart")]
    public async Task<IActionResult> GetChart(Guid babyId)
    {
        var result = await Mediator.Send(new GetGrowthChartQuery(babyId));
        return Ok(result);
    }
}

public record LogGrowthRequest(DateTime MeasuredAt, decimal WeightKg, decimal? LengthCm, decimal? HeadCircumferenceCm, string? Notes);
