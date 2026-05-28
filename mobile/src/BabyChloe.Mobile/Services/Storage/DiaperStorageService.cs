namespace BabyChloe.Mobile.Services.Storage;

public class DiaperStorageService
{
    private readonly LocalDatabase _db;

    public DiaperStorageService(LocalDatabase db) => _db = db;

    public async Task<string> LogDiaperChangeAsync(string babyId, string type, string? notes, string recordedBy)
    {
        var conn = await _db.GetConnectionAsync();

        // Duplicate prevention: check for change within last 60 seconds
        var cutoff = DateTime.UtcNow.AddSeconds(-60);
        var recent = await conn.Table<LocalDiaperChange>()
            .Where(d => d.BabyId == babyId && d.Timestamp > cutoff)
            .FirstOrDefaultAsync();

        if (recent != null)
            throw new InvalidOperationException("A diaper change was already logged within the last 60 seconds.");

        var change = new LocalDiaperChange
        {
            BabyId = babyId,
            Timestamp = DateTime.UtcNow,
            Type = type,
            Notes = notes,
            RecordedBy = recordedBy
        };
        await conn.InsertAsync(change);
        return change.Id;
    }

    public async Task<(int Total, int Wet, int Soiled, string HealthStatus, string Insight)> GetTodayStatisticsAsync(string babyId)
    {
        var conn = await _db.GetConnectionAsync();
        var today = DateTime.UtcNow.Date;
        var changes = await conn.Table<LocalDiaperChange>()
            .Where(d => d.BabyId == babyId && d.Timestamp >= today)
            .ToListAsync();

        var wetCount = changes.Count(d => d.Type == "Wet" || d.Type == "Both");
        var soiledCount = changes.Count(d => d.Type == "Soiled" || d.Type == "Both");

        var (healthStatus, insight) = wetCount switch
        {
            >= 8 => ("Healthy", "Great hydration today! 💧"),
            >= 5 => ("Advisory", "Good day so far! Keep up the feedings. 🌟"),
            _ => ("Concern", "A bit below typical. Keep offering feeds. 💕")
        };

        return (changes.Count, wetCount, soiledCount, healthStatus, insight);
    }

    public async Task<List<LocalDiaperChange>> GetPendingSyncAsync()
    {
        var conn = await _db.GetConnectionAsync();
        return await conn.Table<LocalDiaperChange>()
            .Where(d => d.SyncStatus == "Pending")
            .ToListAsync();
    }
}