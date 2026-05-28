namespace BabyChloe.Mobile.Services.Storage;

public class SleepStorageService
{
    private readonly LocalDatabase _db;

    public SleepStorageService(LocalDatabase db) => _db = db;

    public async Task<string> StartSleepAsync(string babyId, string quality, string location, bool wasSwaddled, string recordedBy)
    {
        var conn = await _db.GetConnectionAsync();
        var record = new LocalSleepRecord
        {
            BabyId = babyId,
            StartTime = DateTime.UtcNow,
            Quality = quality,
            Location = location,
            WasSwaddled = wasSwaddled,
            RecordedBy = recordedBy
        };
        await conn.InsertAsync(record);
        return record.Id;
    }

    public async Task EndSleepAsync(string id)
    {
        var conn = await _db.GetConnectionAsync();
        var record = await conn.FindAsync<LocalSleepRecord>(id);
        if (record != null)
        {
            record.EndTime = DateTime.UtcNow;
            record.LastModifiedUtc = DateTime.UtcNow;
            await conn.UpdateAsync(record);
        }
    }

    public async Task<LocalSleepRecord?> GetActiveSleepAsync(string babyId)
    {
        var conn = await _db.GetConnectionAsync();
        return await conn.Table<LocalSleepRecord>()
            .Where(s => s.BabyId == babyId && s.EndTime == null)
            .FirstOrDefaultAsync();
    }

    public async Task<List<LocalSleepRecord>> GetTodaySleepAsync(string babyId)
    {
        var conn = await _db.GetConnectionAsync();
        var today = DateTime.UtcNow.Date;
        return await conn.Table<LocalSleepRecord>()
            .Where(s => s.BabyId == babyId && s.StartTime >= today)
            .ToListAsync();
    }

    public async Task<List<LocalSleepRecord>> GetPendingSyncAsync()
    {
        var conn = await _db.GetConnectionAsync();
        return await conn.Table<LocalSleepRecord>()
            .Where(s => s.SyncStatus == "Pending")
            .ToListAsync();
    }

    public async Task MarkSyncedAsync(string id)
    {
        var conn = await _db.GetConnectionAsync();
        var record = await conn.FindAsync<LocalSleepRecord>(id);
        if (record != null)
        {
            record.SyncStatus = "Synced";
            await conn.UpdateAsync(record);
        }
    }
}