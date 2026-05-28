namespace BabyChloe.Domain.Entities;

public class FeedingReminder
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BabyId { get; set; }
    public DateTime NextDueAt { get; set; }
    public int AverageIntervalMinutes { get; set; }
    public bool IsActive { get; set; } = true;
    public int OffsetMinutes { get; set; } = 10;
    public DateTime LastCalculatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Baby Baby { get; set; } = null!;
}
