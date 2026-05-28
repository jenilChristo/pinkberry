namespace BabyChloe.Domain.Entities;

public class Caregiver : BaseEntity
{
    public string DisplayName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? AvatarUrl { get; set; }
    public string? AuthProvider { get; set; }
    public string? AuthProviderId { get; set; }

    // Navigation properties
    public ICollection<FamilyMembership> Memberships { get; set; } = new List<FamilyMembership>();
}
