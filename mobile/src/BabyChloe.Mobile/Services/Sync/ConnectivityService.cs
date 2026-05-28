namespace BabyChloe.Mobile.Services.Sync;

public class ConnectivityService
{
    public event EventHandler<bool>? ConnectivityChanged;

    private bool _isConnected;
    public bool IsConnected
    {
        get => _isConnected;
        private set
        {
            if (_isConnected != value)
            {
                _isConnected = value;
                ConnectivityChanged?.Invoke(this, value);
            }
        }
    }

    public ConnectivityService()
    {
        // In a real MAUI app this would use Connectivity.Current
        _isConnected = true;
    }

    public void UpdateConnectivity(bool connected)
    {
        IsConnected = connected;
    }
}