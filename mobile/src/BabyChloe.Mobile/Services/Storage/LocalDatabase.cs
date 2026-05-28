using SQLite;

namespace BabyChloe.Mobile.Services.Storage;

public class LocalDatabase
{
    private SQLiteAsyncConnection? _database;
    private readonly string _dbPath;

    public LocalDatabase()
    {
        _dbPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "babychloe.db3");
    }

    public async Task<SQLiteAsyncConnection> GetConnectionAsync()
    {
        if (_database != null) return _database;

        _database = new SQLiteAsyncConnection(_dbPath);
        await _database.CreateTableAsync<LocalSleepRecord>();
        await _database.CreateTableAsync<LocalFeeding>();
        await _database.CreateTableAsync<LocalDiaperChange>();
        await _database.CreateTableAsync<LocalGrowthMeasurement>();
        await _database.CreateTableAsync<LocalBaby>();

        return _database;
    }
}
