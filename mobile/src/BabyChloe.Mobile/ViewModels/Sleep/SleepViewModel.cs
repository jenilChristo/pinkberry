using System.Timers;
using BabyChloe.Mobile.Services.Storage;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace BabyChloe.Mobile.ViewModels.Sleep;

public partial class SleepViewModel : ObservableObject
{
    private readonly SleepStorageService _sleepStorage;
    private System.Timers.Timer? _timer;

    [ObservableProperty] private bool _isSleeping;
    [ObservableProperty] private string _timerDisplay = "00:00:00";
    [ObservableProperty] private string _statusMessage = "Tap to start sleep tracking";
    [ObservableProperty] private string _selectedQuality = "Peaceful";
    [ObservableProperty] private string _selectedLocation = "Crib";
    [ObservableProperty] private DateTime _sleepStartTime;
    [ObservableProperty] private string? _activeSleepId;

    private string _currentBabyId = string.Empty;
    private string _currentCaregiverId = string.Empty;

    public SleepViewModel(SleepStorageService sleepStorage)
    {
        _sleepStorage = sleepStorage;
    }

    public async Task InitializeAsync(string babyId, string caregiverId)
    {
        _currentBabyId = babyId;
        _currentCaregiverId = caregiverId;

        var active = await _sleepStorage.GetActiveSleepAsync(babyId);
        if (active != null)
        {
            IsSleeping = true;
            SleepStartTime = active.StartTime;
            ActiveSleepId = active.Id;
            StartTimer();
        }
    }

    [RelayCommand]
    private async Task ToggleSleep()
    {
        if (IsSleeping)
        {
            await StopSleep();
        }
        else
        {
            await StartSleep();
        }
    }

    private async Task StartSleep()
    {
        SleepStartTime = DateTime.UtcNow;
        ActiveSleepId = await _sleepStorage.StartSleepAsync(
            _currentBabyId, SelectedQuality, SelectedLocation, false, _currentCaregiverId);
        IsSleeping = true;
        StatusMessage = "Sweet dreams... 🌙";
        StartTimer();
    }

    private async Task StopSleep()
    {
        if (ActiveSleepId != null)
        {
            await _sleepStorage.EndSleepAsync(ActiveSleepId);
            var duration = DateTime.UtcNow - SleepStartTime;
            StatusMessage = $"Slept for {duration:h\\:mm\\:ss}. Great rest! ✨";
        }
        IsSleeping = false;
        ActiveSleepId = null;
        StopTimer();
    }

    private void StartTimer()
    {
        _timer = new System.Timers.Timer(1000);
        _timer.Elapsed += OnTimerElapsed;
        _timer.Start();
    }

    private void StopTimer()
    {
        _timer?.Stop();
        _timer?.Dispose();
        _timer = null;
        TimerDisplay = "00:00:00";
    }

    private void OnTimerElapsed(object? sender, ElapsedEventArgs e)
    {
        var elapsed = DateTime.UtcNow - SleepStartTime;
        TimerDisplay = elapsed.ToString(@"hh\:mm\:ss");
    }
}