using SQLite;

namespace BabyChloe.Mobile.Services.Storage;

[Table("babies")]
public class LocalBaby
{
    [PrimaryKey]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public string Gender { get; set; } = "Other";
    public decimal BirthWeightKg { get; set; }
    public decimal BirthLengthCm { get; set; }
    public string? PhotoUrl { get; set; }
    public string FamilyId { get; set; } = string.Empty;
    public string SyncStatus { get; set; } = "Pending";
    public DateTime LastModifiedUtc { get; set; } = DateTime.UtcNow;
}

[Table("sleep_records")]
public class LocalSleepRecord
{
    [PrimaryKey]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string BabyId { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string Quality { get; set; } = "Peaceful";
    public string Location { get; set; } = "Crib";
    public bool WasSwaddled { get; set; }
    public string? Notes { get; set; }
    public string RecordedBy { get; set; } = string.Empty;
    public string SyncStatus { get; set; } = "Pending";
    public DateTime LastModifiedUtc { get; set; } = DateTime.UtcNow;
}

[Table("feedings")]
public class LocalFeeding
{
    [PrimaryKey]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string BabyId { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string Type { get; set; } = "Breastfeeding";
    public string? Side { get; set; }
    public decimal? AmountMl { get; set; }
    public string? Notes { get; set; }
    public string RecordedBy { get; set; } = string.Empty;
    public string SyncStatus { get; set; } = "Pending";
    public DateTime LastModifiedUtc { get; set; } = DateTime.UtcNow;
}

[Table("diaper_changes")]
public class LocalDiaperChange
{
    [PrimaryKey]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string BabyId { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string Type { get; set; } = "Wet";
    public string? Notes { get; set; }
    public string RecordedBy { get; set; } = string.Empty;
    public string SyncStatus { get; set; } = "Pending";
    public DateTime LastModifiedUtc { get; set; } = DateTime.UtcNow;
}

[Table("growth_measurements")]
public class LocalGrowthMeasurement
{
    [PrimaryKey]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string BabyId { get; set; } = string.Empty;
    public DateTime MeasuredAt { get; set; }
    public decimal WeightKg { get; set; }
    public decimal? LengthCm { get; set; }
    public decimal? HeadCircumferenceCm { get; set; }
    public string? Notes { get; set; }
    public string RecordedBy { get; set; } = string.Empty;
    public string SyncStatus { get; set; } = "Pending";
    public DateTime LastModifiedUtc { get; set; } = DateTime.UtcNow;
}
