using BabyChloe.Mobile.Services.Storage;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace BabyChloe.Mobile.ViewModels.Growth;

public partial class GrowthViewModel : ObservableObject
{
    private readonly GrowthStorageService _growthStorage;

    [ObservableProperty] private decimal _weightKg;
    [ObservableProperty] private decimal? _lengthCm;
    [ObservableProperty] private decimal? _headCm;
    [ObservableProperty] private string? _notes;
    [ObservableProperty] private string _statusMessage = string.Empty;
    [ObservableProperty] private string _lastMeasurement = "No measurements yet";

    private string _currentBabyId = string.Empty;
    private string _currentCaregiverId = string.Empty;

    public GrowthViewModel(GrowthStorageService growthStorage)
    {
        _growthStorage = growthStorage;
    }

    public async Task InitializeAsync(string babyId, string caregiverId)
    {
        _currentBabyId = babyId;
        _currentCaregiverId = caregiverId;
        await LoadLatest();
    }

    [RelayCommand]
    private async Task LogMeasurement()
    {
        if (WeightKg <= 0)
        {
            StatusMessage = "Please enter a valid weight.";
            return;
        }

        await _growthStorage.LogMeasurementAsync(
            _currentBabyId, WeightKg, LengthCm, HeadCm, Notes, _currentCaregiverId);
        StatusMessage = "Measurement saved! 📏";
        await LoadLatest();

        // Reset form
        WeightKg = 0;
        LengthCm = null;
        HeadCm = null;
        Notes = null;
    }

    private async Task LoadLatest()
    {
        var latest = await _growthStorage.GetLatestAsync(_currentBabyId);
        if (latest != null)
        {
            LastMeasurement = $"{latest.WeightKg:F2} kg on {latest.MeasuredAt:MMM dd}";
        }
    }
}