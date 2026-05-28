using BabyChloe.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BabyChloe.Infrastructure.Persistence;

public class BabyChloeDbContext : DbContext
{
    public BabyChloeDbContext(DbContextOptions<BabyChloeDbContext> options) : base(options) { }

    public DbSet<Baby> Babies => Set<Baby>();
    public DbSet<Family> Families => Set<Family>();
    public DbSet<Caregiver> Caregivers => Set<Caregiver>();
    public DbSet<FamilyMembership> FamilyMemberships => Set<FamilyMembership>();
    public DbSet<SleepRecord> SleepRecords => Set<SleepRecord>();
    public DbSet<Feeding> Feedings => Set<Feeding>();
    public DbSet<DiaperChange> DiaperChanges => Set<DiaperChange>();
    public DbSet<GrowthMeasurement> GrowthMeasurements => Set<GrowthMeasurement>();
    public DbSet<FeedingReminder> FeedingReminders => Set<FeedingReminder>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // FamilyMembership composite key
        modelBuilder.Entity<FamilyMembership>()
            .HasKey(fm => new { fm.FamilyId, fm.CaregiverId });

        modelBuilder.Entity<FamilyMembership>()
            .HasOne(fm => fm.Family)
            .WithMany(f => f.Members)
            .HasForeignKey(fm => fm.FamilyId);

        modelBuilder.Entity<FamilyMembership>()
            .HasOne(fm => fm.Caregiver)
            .WithMany(c => c.Memberships)
            .HasForeignKey(fm => fm.CaregiverId);

        // Family -> Babies
        modelBuilder.Entity<Baby>()
            .HasOne(b => b.Family)
            .WithMany(f => f.Babies)
            .HasForeignKey(b => b.FamilyId);

        // Baby -> SleepRecords
        modelBuilder.Entity<SleepRecord>()
            .HasOne(s => s.Baby)
            .WithMany(b => b.SleepRecords)
            .HasForeignKey(s => s.BabyId);

        modelBuilder.Entity<SleepRecord>()
            .HasOne(s => s.Recorder)
            .WithMany()
            .HasForeignKey(s => s.RecordedBy)
            .OnDelete(DeleteBehavior.NoAction);

        // Baby -> Feedings
        modelBuilder.Entity<Feeding>()
            .HasOne(f => f.Baby)
            .WithMany(b => b.Feedings)
            .HasForeignKey(f => f.BabyId);

        modelBuilder.Entity<Feeding>()
            .HasOne(f => f.Recorder)
            .WithMany()
            .HasForeignKey(f => f.RecordedBy)
            .OnDelete(DeleteBehavior.NoAction);

        // Baby -> DiaperChanges
        modelBuilder.Entity<DiaperChange>()
            .HasOne(d => d.Baby)
            .WithMany(b => b.DiaperChanges)
            .HasForeignKey(d => d.BabyId);

        modelBuilder.Entity<DiaperChange>()
            .HasOne(d => d.Recorder)
            .WithMany()
            .HasForeignKey(d => d.RecordedBy)
            .OnDelete(DeleteBehavior.NoAction);

        // Baby -> GrowthMeasurements
        modelBuilder.Entity<GrowthMeasurement>()
            .HasOne(g => g.Baby)
            .WithMany(b => b.GrowthMeasurements)
            .HasForeignKey(g => g.BabyId);

        modelBuilder.Entity<GrowthMeasurement>()
            .HasOne(g => g.Recorder)
            .WithMany()
            .HasForeignKey(g => g.RecordedBy)
            .OnDelete(DeleteBehavior.NoAction);

        // Baby -> FeedingReminder (one-to-one)
        modelBuilder.Entity<FeedingReminder>()
            .HasOne(fr => fr.Baby)
            .WithMany()
            .HasForeignKey(fr => fr.BabyId);

        // Family invite code unique index
        modelBuilder.Entity<Family>()
            .HasIndex(f => f.InviteCode)
            .IsUnique();

        // Caregiver email unique index
        modelBuilder.Entity<Caregiver>()
            .HasIndex(c => c.Email)
            .IsUnique()
            .HasFilter("\"Email\" IS NOT NULL");

        // String length constraints
        modelBuilder.Entity<Baby>().Property(b => b.Name).HasMaxLength(100);
        modelBuilder.Entity<Family>().Property(f => f.Name).HasMaxLength(100);
        modelBuilder.Entity<Family>().Property(f => f.InviteCode).HasMaxLength(8);
        modelBuilder.Entity<Caregiver>().Property(c => c.DisplayName).HasMaxLength(100);
        modelBuilder.Entity<SleepRecord>().Property(s => s.Notes).HasMaxLength(500);
        modelBuilder.Entity<Feeding>().Property(f => f.Notes).HasMaxLength(500);
        modelBuilder.Entity<DiaperChange>().Property(d => d.Notes).HasMaxLength(500);
        modelBuilder.Entity<GrowthMeasurement>().Property(g => g.Notes).HasMaxLength(500);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.LastModifiedUtc = DateTime.UtcNow;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
