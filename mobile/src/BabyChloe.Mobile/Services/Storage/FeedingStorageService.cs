namespace BabyChloe.Mobile.Services.Storage;

public class FeedingStorageService
{
    private readonly LocalDatabase _db;

    public FeedingStorageService(LocalDatabase db) => _db = db;

    public async Task<string> StartFeedingAsync(string babyId, string type, string? side, decimal? amountMl, string recordedBy)
    {
        var conn = await _db.GetConnectionAsync();
        var feeding = new LocalFeeding
        {
            BabyId = babyId,
            StartTime = DateTime.UtcNow,
            Type = type,
            Side = side,
            AmountMl = amountMl,
            RecordedBy = recordedBy
        };
        await conn.InsertAsync(feeding);
        return feeding.Id;
    }

    public async Task EndFeedingAsync(string id)
    {
        var conn = await _db.GetConnectionAsync();
        var feeding = await conn.FindAsync<LocalFeeding>(id);
        if (feeding != null)
        {
            feeding.EndTime = DateTime.UtcNow;
            feeding.LastModifiedUtc = DateTime.UtcNow;
            await conn.UpdateAsync(feeding);
        }
    }

    public async Task<List<LocalFeeding>> GetRecentFeedingsAsync(string babyId, int count = 7)
    {
        var conn = await _db.GetConnectionAsync();
        return await conn.Table<LocalFeeding>()
            .Where(f => f.BabyId == babyId && f.EndTime != null)
            .OrderByDescending(f => f.StartTime)
            .Take(count)
            .ToListAsync();
    }

    public async Task<DateTime> CalculateNextFeedingDueAsync(string babyId)
    {
        var recent = await GetRecentFeedingsAsync(babyId, 7);
        if (recent.Count < 2)
            return (recent.FirstOrDefault()?.EndTime ?? DateTime.UtcNow).AddHours(3);

        var intervals = new List<double>();
        for (int i = 0; i < recent.Count - 1; i++)
        {
            intervals.Add((recent[i].StartTime - recent[i + 1].StartTime).TotalMinutes);
        }

        var weightedSum = 0.0;
        var weightTotal = 0.0;
        for (int i = 0; i < intervals.Count; i++)
        {
            var weight = intervals.Count - i;
            weightedSum += intervals[i] * weight;
            weightTotal += weight;
        }

        var avgMinutes = weightedSum / weightTotal;
        return recent[0].StartTime.AddMinutes(avgMinutes);
    }

    public async Task<List<LocalFeeding>> GetPendingSyncAsync()
    {
        var conn = await _db.GetConnectionAsync();
        return await conn.Table<LocalFeeding>()
            .Where(f => f.SyncStatus == "Pending")
            .ToListAsync();
    }
}