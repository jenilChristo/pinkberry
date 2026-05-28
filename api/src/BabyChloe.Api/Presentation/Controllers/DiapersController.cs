using BabyChloe.Application.Commands.Diaper;
using BabyChloe.Application.Queries.Diaper;
using BabyChloe.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BabyChloe.Api.Presentation.Controllers;

[ApiController]
[Route("api/v1/babies/{babyId:guid}/diapers")]
[Authorize]
public class DiapersController : BaseApiController
{
    [HttpPost]
    public async Task<IActionResult> Log(Guid babyId, [FromBody] LogDiaperRequest request)
    {
        var id = await Mediator.Send(new LogDiaperChangeCommand(
            babyId, request.Timestamp, request.Type, request.Notes, GetCaregiverId()));
        return CreatedAtAction(nameof(GetStatistics), new { babyId }, new { id });
    }

    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics(Guid babyId, [FromQuery] DateTime? date)
    {
        var result = await Mediator.Send(new GetDiaperStatisticsQuery(babyId, date));
        return Ok(result);
    }
}

public record LogDiaperRequest(DateTime Timestamp, DiaperType Type, string? Notes);
