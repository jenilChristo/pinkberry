namespace BabyChloe.Mobile.Services;

public enum AppTheme
{
    Light,
    Dark,
    UltraNight
}

public class ThemeService
{
    private Timer? _autoThemeTimer;
    public AppTheme CurrentTheme { get; private set; } = AppTheme.Light;
    public event EventHandler<AppTheme>? ThemeChanged;

    public void SetTheme(AppTheme theme)
    {
        CurrentTheme = theme;
        ThemeChanged?.Invoke(this, theme);
    }

    public void EnableAutoUltraNight()
    {
        _autoThemeTimer = new Timer(CheckTimeForUltraNight, null,
            TimeSpan.Zero, TimeSpan.FromMinutes(15));
    }

    private void CheckTimeForUltraNight(object? state)
    {
        var hour = DateTime.Now.Hour;
        var shouldBeUltraNight = hour >= 21 || hour < 6;

        if (shouldBeUltraNight && CurrentTheme != AppTheme.UltraNight)
        {
            SetTheme(AppTheme.UltraNight);
        }
        else if (!shouldBeUltraNight && CurrentTheme == AppTheme.UltraNight)
        {
            SetTheme(AppTheme.Light);
        }
    }
}