using BabyChloe.Mobile.Services;
using BabyChloe.Mobile.Services.Storage;
using BabyChloe.Mobile.Services.Sync;
using BabyChloe.Mobile.Services.Notifications;
using BabyChloe.Mobile.ViewModels.Dashboard;
using BabyChloe.Mobile.ViewModels.Sleep;
using BabyChloe.Mobile.ViewModels.Feeding;
using BabyChloe.Mobile.ViewModels.Diaper;
using BabyChloe.Mobile.ViewModels.Growth;
using BabyChloe.Mobile.ViewModels.Activity;
using BabyChloe.Mobile.Views.Dashboard;
using BabyChloe.Mobile.Views.Sleep;
using BabyChloe.Mobile.Views.Feeding;
using BabyChloe.Mobile.Views.Diaper;
using BabyChloe.Mobile.Views.Growth;
using BabyChloe.Mobile.Views.Activity;
using BabyChloe.Mobile.Views.Settings;
using SkiaSharp.Views.Maui.Controls.Hosting;

namespace BabyChloe.Mobile;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .UseSkiaSharp();

        // Services
        builder.Services.AddSingleton<LocalDatabase>();
        builder.Services.AddSingleton<SleepStorageService>();
        builder.Services.AddSingleton<FeedingStorageService>();
        builder.Services.AddSingleton<DiaperStorageService>();
        builder.Services.AddSingleton<GrowthStorageService>();
        builder.Services.AddSingleton<ThemeService>();
        builder.Services.AddSingleton<HapticService>();
        builder.Services.AddSingleton<InsightLanguageService>();
        builder.Services.AddSingleton<ConnectivityService>();
        builder.Services.AddSingleton<SignalRService>();
        builder.Services.AddSingleton<BackgroundSyncService>();
        builder.Services.AddSingleton<SyncQueue>();
        builder.Services.AddSingleton<FeedingReminderService>();

        // ViewModels
        builder.Services.AddTransient<DashboardViewModel>();
        builder.Services.AddTransient<SleepViewModel>();
        builder.Services.AddTransient<FeedingViewModel>();
        builder.Services.AddTransient<DiaperViewModel>();
        builder.Services.AddTransient<GrowthViewModel>();
        builder.Services.AddTransient<ActivityFeedViewModel>();

        // Pages
        builder.Services.AddTransient<DashboardPage>();
        builder.Services.AddTransient<SleepPage>();
        builder.Services.AddTransient<FeedingPage>();
        builder.Services.AddTransient<DiaperPage>();
        builder.Services.AddTransient<GrowthPage>();
        builder.Services.AddTransient<GrowthChartPage>();
        builder.Services.AddTransient<ActivityFeedPage>();
        builder.Services.AddTransient<SettingsPage>();

        return builder.Build();
    }
}
