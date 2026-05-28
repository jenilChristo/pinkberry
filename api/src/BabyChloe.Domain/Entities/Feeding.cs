using BabyChloe.Domain.Enums;

namespace BabyChloe.Domain.Entities;

public class Feeding : BaseEntity
{
    public Guid BabyId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public FeedingType Type { get; set; }
    public BreastSide? Side { get; set; }
    public decimal? AmountMl { get; set; }
    public string? Notes { get; set; }
    public Guid RecordedBy { get; set; }

    // Navigation properties
    public Baby Baby { get; set; } = null!;
    public Caregiver Recorder { get; set; } = null!;

    public TimeSpan? Duration => EndTime.HasValue ? EndTime.Value - StartTime : null;
    public bool IsActive => !EndTime.HasValue;
}
