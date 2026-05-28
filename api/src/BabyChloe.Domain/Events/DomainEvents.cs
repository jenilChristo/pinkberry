using MediatR;

namespace BabyChloe.Domain.Events;

public record SleepStartedEvent(Guid BabyId, Guid RecordId, Guid CaregiverId) : INotification;
public record SleepEndedEvent(Guid BabyId, Guid RecordId, TimeSpan Duration, Guid CaregiverId) : INotification;
public record FeedingStartedEvent(Guid BabyId, Guid RecordId, Guid CaregiverId) : INotification;
public record FeedingEndedEvent(Guid BabyId, Guid RecordId, TimeSpan Duration, Guid CaregiverId) : INotification;
public record DiaperLoggedEvent(Guid BabyId, Guid RecordId, Guid CaregiverId) : INotification;
public record GrowthLoggedEvent(Guid BabyId, Guid RecordId, Guid CaregiverId) : INotification;
