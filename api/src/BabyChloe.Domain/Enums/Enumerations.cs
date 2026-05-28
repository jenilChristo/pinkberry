namespace BabyChloe.Domain.Enums;

public enum Gender
{
    Male,
    Female,
    Other
}

public enum CaregiverRole
{
    Primary,
    Secondary,
    ViewOnly
}

public enum SleepQuality
{
    Peaceful,
    Restless,
    Fussy,
    Crying
}

public enum SleepLocation
{
    Crib,
    Bassinet,
    CarSeat,
    Stroller,
    ParentArms,
    ParentBed
}

public enum FeedingType
{
    Breastfeeding,
    Bottle,
    Formula
}

public enum BreastSide
{
    Left,
    Right,
    Both
}

public enum DiaperType
{
    Wet,
    Soiled,
    Both,
    Dry
}

public enum SyncStatus
{
    Pending,
    Synced,
    Conflict
}
