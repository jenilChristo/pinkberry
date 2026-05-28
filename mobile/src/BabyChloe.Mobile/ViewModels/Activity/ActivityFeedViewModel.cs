using BabyChloe.Mobile.Services.Storage;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace BabyChloe.Mobile.ViewModels.Activity;

public partial class ActivityFeedViewModel : ObservableObject
{
    private readonly SleepStorageService _sleepStorage;
    private readonly FeedingStorageService _feedingStorage;
    private readonly DiaperStorageService _diaperStorage;

    [ObservableProperty] private List<ActivityItem> _activities = new();

    private string _currentBabyId = string.Empty;

    public ActivityFeedViewModel(SleepStorageService sleepStorage, FeedingStorageService feedingStorage, DiaperStorageService diaperStorage)
    {
        _sleepStorage = sleepStorage;
        _feedingStorage = feedingStorage;
        _diaperStorage = diaperStorage;
    }

    public async Task InitializeAsync(string babyId)
    {
        _currentBabyId = babyId;
        await RefreshAsync();
    }

    [RelayCommand]
    private async Task Refresh()
    {
        await RefreshAsync();
    }

    private async Task RefreshAsync()
    {
        var items = new List<ActivityItem>();

        var sleepRecords = await _sleepStorage.GetTodaySleepAsync(_currentBabyId);
        items.AddRange(sleepRecords.Select(s => new ActivityItem(
            "Sleep", s.StartTime,
            s.EndTime.HasValue
                ? $"Slept {(s.EndTime.Value - s.StartTime):h\\:mm}"
                : "Sleeping now 🌙")));

        // Note: FeedingStorageService doesn't have GetTodayFeedings yet
        // We use GetRecentFeedingsAsync as approximation
        var recentFeedings = await _feedingStorage.GetRecentFeedingsAsync(_currentBabyId, 20);
        var todayFeedings = recentFeedings.Where(f => f.StartTime.Date == DateTime.UtcNow.Date);
        items.AddRange(todayFeedings.Select(f => new ActivityItem(
            "Feeding", f.StartTime,
            f.EndTime.HasValue
                ? $"{f.Type} for {(f.EndTime.Value - f.StartTime):m\\:ss}"
                : $"{f.Type} in progress")));

        Activities = items.OrderByDescending(a => a.Timestamp).ToList();
    }
}

public record ActivityItem(string Type, DateTime Timestamp, string Description);