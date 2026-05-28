namespace BabyChloe.Mobile.Services;

public class InsightLanguageService
{
    private static readonly string[] SleepEncouragements =
    {
        "Sweet dreams, little one! 🌙",
        "Rest well, tiny angel! ✨",
        "Sleep tight, precious baby! 💤",
        "Dreamland awaits! 🌟"
    };

    private static readonly string[] FeedingEncouragements =
    {
        "Nom nom! Great feeding! 🍼",
        "Growing strong with every sip! 💪",
        "Well fed and happy! 💕",
        "What a good eater! 🌟"
    };

    private static readonly string[] GeneralEncouragements =
    {
        "You're doing amazing! ��",
        "Every moment counts! ✨",
        "What a wonderful parent you are! 🌟",
        "Your love shows in everything! 💖"
    };

    private readonly Random _random = new();

    public string GetSleepInsight() => SleepEncouragements[_random.Next(SleepEncouragements.Length)];
    public string GetFeedingInsight() => FeedingEncouragements[_random.Next(FeedingEncouragements.Length)];
    public string GetGeneralEncouragement() => GeneralEncouragements[_random.Next(GeneralEncouragements.Length)];
}