using BabyChloe.Mobile.Services.Storage;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace BabyChloe.Mobile.ViewModels.Dashboard;

public partial class DashboardViewModel : ObservableObject
{
    private readonly SleepStorageService _sleepStorage;
    private readonly FeedingStorageService _feedingStorage;
    private readonly DiaperStorageService _diaperStorage;

    // Sleep card
    [ObservableProperty] private bool _isSleepActive;
    [ObservableProperty] private string _sleepSummary = "No sleep data today";
    [ObservableProperty] private string _sleepDuration = "--:--";

    // Feeding card
    [ObservableProperty] private string _feedingSummary = "No feedings today";
    [ObservableProperty] private string _nextFeedingDue = "---";

    // Diaper card
    [ObservableProperty] private int _diaperCount;
    [ObservableProperty] private string _diaperHealthStatus = "";
    [ObservableProperty] private string _diaperInsight = "";

    private string _currentBabyId = string.Empty;
    private string _currentCaregiverId = string.Empty;

    public DashboardViewModel(SleepStorageService sleepStorage, FeedingStorageService feedingStorage, DiaperStorageService diaperStorage)
    {
        _sleepStorage = sleepStorage;
        _feedingStorage = feedingStorage;
        _diaperStorage = diaperStorage;
    }

    public async Task InitializeAsync(string babyId, string caregiverId)
    {
        _currentBabyId = babyId;
        _currentCaregiverId = caregiverId;
        await RefreshAsync();
    }

    [RelayCommand]
    private async Task Refresh()
    {
        await RefreshAsync();
    }

    private async Task RefreshAsync()
    {
        // Sleep
        var activeSleep = await _sleepStorage.GetActiveSleepAsync(_currentBabyId);
        IsSleepActive = activeSleep != null;
        if (activeSleep != null)
        {
            var elapsed = DateTime.UtcNow - activeSleep.StartTime;
            SleepSummary = "Currently sleeping 🌙";
            SleepDuration = elapsed.ToString(@"h\:mm");
        }
        else
        {
            var todaySleep = await _sleepStorage.GetTodaySleepAsync(_currentBabyId);
            var completedSleep = todaySleep.Where(s => s.EndTime != null).ToList();
            if (completedSleep.Any())
            {
                var totalSleepTime = completedSleep.Aggregate(TimeSpan.Zero, (sum, s) => sum + (s.EndTime!.Value - s.StartTime));
                SleepSummary = $"{completedSleep.Count} naps today";
                SleepDuration = $"{totalSleepTime:h\\:mm} total";
            }
        }

        // Feeding
        var nextDue = await _feedingStorage.CalculateNextFeedingDueAsync(_currentBabyId);
        var timeUntil = nextDue - DateTime.UtcNow;
        NextFeedingDue = timeUntil.TotalMinutes > 0
            ? $"~{(int)timeUntil.TotalMinutes} min"
            : "Due now!";
        var recent = await _feedingStorage.GetRecentFeedingsAsync(_currentBabyId, 1);
        FeedingSummary = recent.Any()
            ? $"Last: {recent[0].Type} at {recent[0].StartTime:HH:mm}"
            : "No feedings today";

        // Diapers
        var (totalDiapers, wet, soiled, health, insight) = await _diaperStorage.GetTodayStatisticsAsync(_currentBabyId);
        DiaperCount = totalDiapers;
        DiaperHealthStatus = health;
        DiaperInsight = insight;
    }
}