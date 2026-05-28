using System.Timers;
using BabyChloe.Mobile.Services.Storage;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace BabyChloe.Mobile.ViewModels.Feeding;

public partial class FeedingViewModel : ObservableObject
{
    private readonly FeedingStorageService _feedingStorage;
    private System.Timers.Timer? _timer;
    private System.Timers.Timer? _countdownTimer;

    [ObservableProperty] private bool _isFeeding;
    [ObservableProperty] private string _timerDisplay = "00:00";
    [ObservableProperty] private string _selectedType = "Breastfeeding";
    [ObservableProperty] private string? _selectedSide = "Left";
    [ObservableProperty] private decimal? _amountMl;
    [ObservableProperty] private string _nextFeedingDue = "Calculating...";
    [ObservableProperty] private string _statusMessage = "Tap to start feeding";
    [ObservableProperty] private DateTime _feedingStartTime;
    [ObservableProperty] private string? _activeFeedingId;

    private string _currentBabyId = string.Empty;
    private string _currentCaregiverId = string.Empty;

    public FeedingViewModel(FeedingStorageService feedingStorage)
    {
        _feedingStorage = feedingStorage;
    }

    public async Task InitializeAsync(string babyId, string caregiverId)
    {
        _currentBabyId = babyId;
        _currentCaregiverId = caregiverId;
        await UpdateNextFeedingDue();
    }

    [RelayCommand]
    private async Task ToggleFeeding()
    {
        if (IsFeeding)
            await StopFeeding();
        else
            await StartFeeding();
    }

    private async Task StartFeeding()
    {
        FeedingStartTime = DateTime.UtcNow;
        ActiveFeedingId = await _feedingStorage.StartFeedingAsync(
            _currentBabyId, SelectedType, SelectedSide, AmountMl, _currentCaregiverId);
        IsFeeding = true;
        StatusMessage = "Feeding in progress... 🍼";
        StartTimer();
    }

    private async Task StopFeeding()
    {
        if (ActiveFeedingId != null)
        {
            await _feedingStorage.EndFeedingAsync(ActiveFeedingId);
            var duration = DateTime.UtcNow - FeedingStartTime;
            StatusMessage = $"Fed for {duration:m\\:ss}. Well done! 💕";
        }
        IsFeeding = false;
        ActiveFeedingId = null;
        StopTimer();
        await UpdateNextFeedingDue();
    }

    private async Task UpdateNextFeedingDue()
    {
        var nextDue = await _feedingStorage.CalculateNextFeedingDueAsync(_currentBabyId);
        var timeUntil = nextDue - DateTime.UtcNow;
        NextFeedingDue = timeUntil.TotalMinutes > 0
            ? $"Next feeding in ~{(int)timeUntil.TotalMinutes} min"
            : "Feeding may be due soon! 🍼";
    }

    private void StartTimer()
    {
        _timer = new System.Timers.Timer(1000);
        _timer.Elapsed += (_, _) =>
        {
            var elapsed = DateTime.UtcNow - FeedingStartTime;
            TimerDisplay = elapsed.ToString(@"mm\:ss");
        };
        _timer.Start();
    }

    private void StopTimer()
    {
        _timer?.Stop();
        _timer?.Dispose();
        _timer = null;
        TimerDisplay = "00:00";
    }
}