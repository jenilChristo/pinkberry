using BabyChloe.Domain.Enums;

namespace BabyChloe.Domain.Entities;

public class DiaperChange : BaseEntity
{
    public Guid BabyId { get; set; }
    public DateTime Timestamp { get; set; }
    public DiaperType Type { get; set; }
    public string? Notes { get; set; }
    public Guid RecordedBy { get; set; }

    // Navigation properties
    public Baby Baby { get; set; } = null!;
    public Caregiver Recorder { get; set; } = null!;
}
