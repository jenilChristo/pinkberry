using BabyChloe.Application.Queries.Activity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BabyChloe.Api.Presentation.Controllers;

[ApiController]
[Route("api/v1/babies/{babyId:guid}/activity")]
[Authorize]
public class ActivityController : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetFeed(Guid babyId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await Mediator.Send(new GetActivityFeedQuery(babyId, page, pageSize));
        return Ok(result);
    }
}
