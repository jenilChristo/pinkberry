using Microsoft.AspNetCore.SignalR.Client;

namespace BabyChloe.Mobile.Services.Sync;

public class SignalRService : IAsyncDisposable
{
    private HubConnection? _connection;
    public event EventHandler<object>? ActivityReceived;
    public bool IsConnected => _connection?.State == HubConnectionState.Connected;

    public async Task ConnectAsync(string hubUrl, string accessToken, string familyId)
    {
        _connection = new HubConnectionBuilder()
            .WithUrl(hubUrl, options =>
            {
                options.AccessTokenProvider = () => Task.FromResult<string?>(accessToken);
            })
            .WithAutomaticReconnect()
            .Build();

        _connection.On<object>("ActivityReceived", activity =>
        {
            ActivityReceived?.Invoke(this, activity);
        });

        await _connection.StartAsync();
        await _connection.InvokeAsync("JoinFamily", familyId);
    }

    public async Task DisconnectAsync()
    {
        if (_connection != null)
        {
            await _connection.StopAsync();
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (_connection != null)
        {
            await _connection.DisposeAsync();
        }
    }
}