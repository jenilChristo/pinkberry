using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace BabyChloe.Infrastructure.SignalR;

[Authorize]
public class FamilyHub : Hub
{
    public async Task JoinFamily(string familyId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, familyId);
    }

    public async Task LeaveFamily(string familyId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, familyId);
    }

    public async Task BroadcastActivity(string familyId, object activity)
    {
        await Clients.OthersInGroup(familyId).SendAsync("ActivityReceived", activity);
    }
}
