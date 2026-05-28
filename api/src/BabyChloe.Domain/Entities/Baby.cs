using BabyChloe.Domain.Enums;

namespace BabyChloe.Domain.Entities;

public class Baby : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public Gender Gender { get; set; }
    public decimal BirthWeightKg { get; set; }
    public decimal BirthLengthCm { get; set; }
    public string? PhotoUrl { get; set; }
    public Guid FamilyId { get; set; }

    // Navigation properties
    public Family Family { get; set; } = null!;
    public ICollection<SleepRecord> SleepRecords { get; set; } = new List<SleepRecord>();
    public ICollection<Feeding> Feedings { get; set; } = new List<Feeding>();
    public ICollection<DiaperChange> DiaperChanges { get; set; } = new List<DiaperChange>();
    public ICollection<GrowthMeasurement> GrowthMeasurements { get; set; } = new List<GrowthMeasurement>();
}
