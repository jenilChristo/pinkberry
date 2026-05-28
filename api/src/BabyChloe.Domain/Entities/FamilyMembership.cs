using BabyChloe.Domain.Enums;

namespace BabyChloe.Domain.Entities;

public class FamilyMembership
{
    public Guid FamilyId { get; set; }
    public Guid CaregiverId { get; set; }
    public CaregiverRole Role { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Family Family { get; set; } = null!;
    public Caregiver Caregiver { get; set; } = null!;
}
