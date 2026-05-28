namespace BabyChloe.Mobile.Services.Storage;

public class GrowthStorageService
{
    private readonly LocalDatabase _db;

    public GrowthStorageService(LocalDatabase db) => _db = db;

    public async Task<string> LogMeasurementAsync(string babyId, decimal weightKg, decimal? lengthCm, decimal? headCm, string? notes, string recordedBy)
    {
        var conn = await _db.GetConnectionAsync();
        var measurement = new LocalGrowthMeasurement
        {
            BabyId = babyId,
            MeasuredAt = DateTime.UtcNow,
            WeightKg = weightKg,
            LengthCm = lengthCm,
            HeadCircumferenceCm = headCm,
            Notes = notes,
            RecordedBy = recordedBy
        };
        await conn.InsertAsync(measurement);
        return measurement.Id;
    }

    public async Task<List<LocalGrowthMeasurement>> GetAllMeasurementsAsync(string babyId)
    {
        var conn = await _db.GetConnectionAsync();
        return await conn.Table<LocalGrowthMeasurement>()
            .Where(g => g.BabyId == babyId)
            .OrderBy(g => g.MeasuredAt)
            .ToListAsync();
    }

    public async Task<LocalGrowthMeasurement?> GetLatestAsync(string babyId)
    {
        var conn = await _db.GetConnectionAsync();
        return await conn.Table<LocalGrowthMeasurement>()
            .Where(g => g.BabyId == babyId)
            .OrderByDescending(g => g.MeasuredAt)
            .FirstOrDefaultAsync();
    }
}