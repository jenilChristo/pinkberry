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

        // Cosmos DB: Configure containers and partition keys
        modelBuilder.Entity<Family>(entity =>
        {
            entity.ToContainer("Families");
            entity.HasPartitionKey(f => f.Id);
            entity.HasNoDiscriminator();
            entity.Property(f => f.Name).HasMaxLength(100);
            entity.Property(f => f.InviteCode).HasMaxLength(8);
            
            // Navigation to babies
            entity.HasMany(f => f.Babies)
                .WithOne(b => b.Family)
                .HasForeignKey(b => b.FamilyId)
                .OnDelete(DeleteBehavior.NoAction);
                
            // Navigation to memberships
            entity.HasMany(f => f.Members)
                .WithOne(fm => fm.Family)
                .HasForeignKey(fm => fm.FamilyId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Baby>(entity =>
        {
            entity.ToContainer("Babies");
            entity.HasPartitionKey(b => b.FamilyId);
            entity.HasNoDiscriminator();
            entity.Property(b => b.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<Caregiver>(entity =>
        {
            entity.ToContainer("Caregivers");
            entity.HasPartitionKey(c => c.Id);
            entity.HasNoDiscriminator();
            entity.Property(c => c.DisplayName).HasMaxLength(100);
            entity.Property(c => c.Email).HasMaxLength(255);
            
            // Navigation to memberships
            entity.HasMany(c => c.Memberships)
                .WithOne(fm => fm.Caregiver)
                .HasForeignKey(fm => fm.CaregiverId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<SleepRecord>(entity =>
        {
            entity.ToContainer("SleepRecords");
            entity.HasPartitionKey(s => s.BabyId);
            entity.HasNoDiscriminator();
            entity.Property(s => s.Notes).HasMaxLength(500);
            
            entity.HasOne(s => s.Baby)
                .WithMany(b => b.SleepRecords)
                .HasForeignKey(s => s.BabyId)
                .OnDelete(DeleteBehavior.NoAction);
                
            // Note: Recorder relationship crosses partitions, so we only store the ID
            entity.Ignore(s => s.Recorder);
        });

        modelBuilder.Entity<Feeding>(entity =>
        {
            entity.ToContainer("Feedings");
            entity.HasPartitionKey(f => f.BabyId);
            entity.HasNoDiscriminator();
            entity.Property(f => f.Notes).HasMaxLength(500);
            
            entity.HasOne(f => f.Baby)
                .WithMany(b => b.Feedings)
                .HasForeignKey(f => f.BabyId)
                .OnDelete(DeleteBehavior.NoAction);
                
            // Note: Recorder relationship crosses partitions, so we only store the ID
            entity.Ignore(f => f.Recorder);
        });

        modelBuilder.Entity<DiaperChange>(entity =>
        {
            entity.ToContainer("DiaperChanges");
            entity.HasPartitionKey(d => d.BabyId);
            entity.HasNoDiscriminator();
            entity.Property(d => d.Notes).HasMaxLength(500);
            
            entity.HasOne(d => d.Baby)
                .WithMany(b => b.DiaperChanges)
                .HasForeignKey(d => d.BabyId)
                .OnDelete(DeleteBehavior.NoAction);
                
            // Note: Recorder relationship crosses partitions, so we only store the ID
            entity.Ignore(d => d.Recorder);
        });

        modelBuilder.Entity<GrowthMeasurement>(entity =>
        {
            entity.ToContainer("GrowthMeasurements");
            entity.HasPartitionKey(g => g.BabyId);
            entity.HasNoDiscriminator();
            entity.Property(g => g.Notes).HasMaxLength(500);
            
            entity.HasOne(g => g.Baby)
                .WithMany(b => b.GrowthMeasurements)
                .HasForeignKey(g => g.BabyId)
                .OnDelete(DeleteBehavior.NoAction);
                
            // Note: Recorder relationship crosses partitions, so we only store the ID
            entity.Ignore(g => g.Recorder);
        });

        modelBuilder.Entity<FeedingReminder>(entity =>
        {
            entity.ToContainer("FeedingReminders");
            entity.HasPartitionKey(fr => fr.BabyId);
            entity.HasNoDiscriminator();
            
            entity.HasOne(fr => fr.Baby)
                .WithMany()
                .HasForeignKey(fr => fr.BabyId);
        });

        modelBuilder.Entity<FamilyMembership>(entity =>
        {
            entity.ToContainer("FamilyMemberships");
            entity.HasPartitionKey(fm => fm.FamilyId);
            entity.HasNoDiscriminator();
            entity.HasKey(fm => new { fm.FamilyId, fm.CaregiverId });
            entity.Property(fm => fm.Role).HasMaxLength(50);
        });
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
