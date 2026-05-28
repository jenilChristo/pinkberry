using BabyChloe.Application.Queries.Dashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BabyChloe.Api.Presentation.Controllers;

[ApiController]
[Route("api/v1/babies/{babyId:guid}/dashboard")]
[Authorize]
public class DashboardController : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> Get(Guid babyId)
    {
        var result = await Mediator.Send(new GetDashboardQuery(babyId));
        return Ok(result);
    }
}
