using System.Collections.Concurrent;

namespace BabyChloe.Mobile.Services.Sync;

public record SyncItem(string Id, string EntityType, string Action, DateTime QueuedAt);

public class SyncQueue
{
    private readonly ConcurrentQueue<SyncItem> _queue = new();

    public int PendingCount => _queue.Count;

    public void Enqueue(string id, string entityType, string action)
    {
        _queue.Enqueue(new SyncItem(id, entityType, action, DateTime.UtcNow));
    }

    public bool TryDequeue(out SyncItem? item)
    {
        return _queue.TryDequeue(out item);
    }

    public IEnumerable<SyncItem> PeekAll() => _queue.ToArray();
}