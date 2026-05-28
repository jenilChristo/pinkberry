using BabyChloe.Domain.Enums;

namespace BabyChloe.Domain.Entities;

public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastModifiedUtc { get; set; } = DateTime.UtcNow;
    public SyncStatus SyncStatus { get; set; } = SyncStatus.Pending;
}
