using BabyChloe.Mobile.Services.Storage;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace BabyChloe.Mobile.ViewModels.Diaper;

public partial class DiaperViewModel : ObservableObject
{
    private readonly DiaperStorageService _diaperStorage;

    [ObservableProperty] private int _todayCount;
    [ObservableProperty] private int _wetCount;
    [ObservableProperty] private int _soiledCount;
    [ObservableProperty] private string _healthStatus = "Healthy";
    [ObservableProperty] private string _insightMessage = "Start tracking today's changes!";
    [ObservableProperty] private string _statusMessage = string.Empty;

    private string _currentBabyId = string.Empty;
    private string _currentCaregiverId = string.Empty;

    public DiaperViewModel(DiaperStorageService diaperStorage)
    {
        _diaperStorage = diaperStorage;
    }

    public async Task InitializeAsync(string babyId, string caregiverId)
    {
        _currentBabyId = babyId;
        _currentCaregiverId = caregiverId;
        await RefreshStatistics();
    }

    [RelayCommand]
    private async Task LogWet()
    {
        await LogDiaper("Wet");
    }

    [RelayCommand]
    private async Task LogSoiled()
    {
        await LogDiaper("Soiled");
    }

    [RelayCommand]
    private async Task LogBoth()
    {
        await LogDiaper("Both");
    }

    private async Task LogDiaper(string type)
    {
        try
        {
            await _diaperStorage.LogDiaperChangeAsync(_currentBabyId, type, null, _currentCaregiverId);
            StatusMessage = $"{type} diaper logged! ✓";
            await RefreshStatistics();
        }
        catch (InvalidOperationException ex)
        {
            StatusMessage = ex.Message;
        }
    }

    private async Task RefreshStatistics()
    {
        var (total, wet, soiled, health, insight) = await _diaperStorage.GetTodayStatisticsAsync(_currentBabyId);
        TodayCount = total;
        WetCount = wet;
        SoiledCount = soiled;
        HealthStatus = health;
        InsightMessage = insight;
    }
}