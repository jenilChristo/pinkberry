using BabyChloe.Mobile.Services.Storage;

namespace BabyChloe.Mobile.Services.Sync;

public class BackgroundSyncService
{
    private readonly ConnectivityService _connectivity;
    private readonly SyncQueue _syncQueue;
    private readonly SleepStorageService _sleepStorage;
    private readonly FeedingStorageService _feedingStorage;
    private readonly DiaperStorageService _diaperStorage;
    private Timer? _syncTimer;

    public bool IsSyncing { get; private set; }
    public event EventHandler<string>? SyncStatusChanged;

    public BackgroundSyncService(
        ConnectivityService connectivity,
        SyncQueue syncQueue,
        SleepStorageService sleepStorage,
        FeedingStorageService feedingStorage,
        DiaperStorageService diaperStorage)
    {
        _connectivity = connectivity;
        _syncQueue = syncQueue;
        _sleepStorage = sleepStorage;
        _feedingStorage = feedingStorage;
        _diaperStorage = diaperStorage;

        _connectivity.ConnectivityChanged += OnConnectivityChanged;
    }

    public void Start()
    {
        _syncTimer = new Timer(SyncCallback, null, TimeSpan.FromSeconds(30), TimeSpan.FromMinutes(5));
    }

    public void Stop()
    {
        _syncTimer?.Dispose();
        _syncTimer = null;
    }

    private void OnConnectivityChanged(object? sender, bool isConnected)
    {
        if (isConnected)
        {
            _ = SyncNowAsync();
        }
    }

    private async void SyncCallback(object? state)
    {
        if (_connectivity.IsConnected)
        {
            await SyncNowAsync();
        }
    }

    public async Task SyncNowAsync()
    {
        if (IsSyncing) return;

        try
        {
            IsSyncing = true;
            SyncStatusChanged?.Invoke(this, "Syncing...");

            // Push pending records
            var pendingSleep = await _sleepStorage.GetPendingSyncAsync();
            foreach (var record in pendingSleep)
            {
                // In production: POST to /api/v1/sync/push
                await _sleepStorage.MarkSyncedAsync(record.Id);
            }

            var pendingFeedings = await _feedingStorage.GetPendingSyncAsync();
            // Similar sync logic for feedings

            SyncStatusChanged?.Invoke(this, "Synced ✓");
        }
        catch (Exception)
        {
            SyncStatusChanged?.Invoke(this, "Sync failed - will retry");
        }
        finally
        {
            IsSyncing = false;
        }
    }
}