using BabyChloe.Mobile.Services.Storage;

namespace BabyChloe.Mobile.Services.Notifications;

public class FeedingReminderService
{
    private readonly FeedingStorageService _feedingStorage;
    private Timer? _checkTimer;

    public event EventHandler<string>? ReminderTriggered;

    public FeedingReminderService(FeedingStorageService feedingStorage)
    {
        _feedingStorage = feedingStorage;
    }

    public void Start(string babyId)
    {
        _checkTimer = new Timer(async _ => await CheckReminder(babyId), null,
            TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(5));
    }

    public void Stop()
    {
        _checkTimer?.Dispose();
        _checkTimer = null;
    }

    private async Task CheckReminder(string babyId)
    {
        var nextDue = await _feedingStorage.CalculateNextFeedingDueAsync(babyId);
        var timeUntil = nextDue - DateTime.UtcNow;

        if (timeUntil <= TimeSpan.FromMinutes(10) && timeUntil > TimeSpan.Zero)
        {
            ReminderTriggered?.Invoke(this,
                $"Feeding may be due in about {(int)timeUntil.TotalMinutes} minutes 🍼");
        }
    }
}