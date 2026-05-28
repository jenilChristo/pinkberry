namespace BabyChloe.Domain.Entities;

public class Family : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string InviteCode { get; set; } = GenerateInviteCode();

    // Navigation properties
    public ICollection<Baby> Babies { get; set; } = new List<Baby>();
    public ICollection<FamilyMembership> Members { get; set; } = new List<FamilyMembership>();

    private static string GenerateInviteCode() =>
        Guid.NewGuid().ToString("N")[..8].ToUpperInvariant();
}
