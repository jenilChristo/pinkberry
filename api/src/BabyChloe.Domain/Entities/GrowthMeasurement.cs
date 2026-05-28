using BabyChloe.Domain.Enums;

namespace BabyChloe.Domain.Entities;

public class GrowthMeasurement : BaseEntity
{
    public Guid BabyId { get; set; }
    public DateTime MeasuredAt { get; set; }
    public decimal WeightKg { get; set; }
    public decimal? LengthCm { get; set; }
    public decimal? HeadCircumferenceCm { get; set; }
    public string? Notes { get; set; }
    public Guid RecordedBy { get; set; }

    // Navigation properties
    public Baby Baby { get; set; } = null!;
    public Caregiver Recorder { get; set; } = null!;
}
