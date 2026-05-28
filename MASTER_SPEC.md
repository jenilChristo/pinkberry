# Baby Chloe - Master Specification for Implementation

## Project Overview
Baby Chloe is a comprehensive baby tracking application that serves as both a technical showcase for Microsoft interviews and a genuinely useful tool for new parents. This spec combines architecture, design patterns, and detailed requirements.

## Mother-First Design Philosophy

### Core UX Principles (Non-Negotiable)
1. **One-Handed Operation**: All primary actions must be thumb-reachable
2. **Loving Language**: Always encouraging, never alarming ("Time for feeding 💙" not "OVERDUE!")
3. **Gentle Notifications**: Soft sounds, gradual volume, compassionate messages
4. **Dark Mode Essential**: Ultra-low brightness for nighttime (3 AM feedings)
5. **Offline Always**: Full functionality without internet
6. **Privacy First**: Local storage by default, no ads, no tracking
7. **Quick Actions**: One-tap logging, voice commands
8. **Emergency Access**: Pediatrician contact one tap away

## Technical Stack

### Backend
- **Framework**: ASP.NET Core 8+ Web API
- **Architecture**: Clean Architecture with CQRS (MediatR)
- **Database**: PostgreSQL with Entity Framework Core
- **Cache**: Redis for real-time data
- **Real-time**: SignalR for video streaming
- **Auth**: OAuth 2.0 / JWT
- **Patterns**: Repository + Unit of Work, Domain Events, Polly resilience

### Frontend Mobile
- **Framework**: .NET MAUI
- **UI**: Microsoft Fluent UI for MAUI
- **Pattern**: MVVM with CommunityToolkit.Mvvm
- **Storage**: SQLite (offline-first)
- **Voice**: Speech recognition for hands-free
- **Wearables**: Apple Watch, WearOS support

### Production Patterns (Critical for Interviews)
- ✅ Polly resilience (retry, circuit breaker, timeout, bulkhead)
- ✅ Health checks (/health, /health/ready, /health/live)
- ✅ Background services (IHostedService)
- ✅ Rate limiting (100 req/min per user)
- ✅ Telemetry (Application Insights)
- ✅ Async/await with ConfigureAwait(false)
- ✅ Nullable reference types (C# 12)
- ✅ Global exception handling

## Core Features (Priority Order)

### Phase 1: MVP Features

#### 1. Sleep Tracking (CRITICAL - Priority 0)
**Why**: Sleep is the #1 concern for new parents. Essential feature.

**User Stories**:
- Log sleep start/end with one tap
- See total daily/nightly sleep duration
- Track sleep quality (Peaceful, Restless, Fussy, Crying)
- Track location (Crib, Bassinet, Car Seat, etc.)
- Get loving insights ("Longest stretch: 4.5 hours 🌙")

**API Endpoints**:
```
POST   /api/v1/babies/{babyId}/sleep
GET    /api/v1/babies/{babyId}/sleep
GET    /api/v1/babies/{babyId}/sleep/active
PUT    /api/v1/babies/{babyId}/sleep/{id}/end
GET    /api/v1/babies/{babyId}/sleep/statistics
GET    /api/v1/babies/{babyId}/sleep/patterns
GET    /api/v1/babies/{babyId}/sleep/insights
```

**Data Model**:
```csharp
public class SleepRecord
{
    public Guid Id { get; set; }
    public Guid BabyId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public SleepQuality Quality { get; set; } // Peaceful, Restless, Fussy, Crying
    public SleepLocation Location { get; set; } // Crib, Bassinet, CarSeat, etc.
    public bool WasSwaddled { get; set; }
    public string? Notes { get; set; }
    public Guid RecordedBy { get; set; }
}

public enum SleepQuality { Peaceful, Restless, Fussy, Crying }
public enum SleepLocation { Crib, Bassinet, CarSeat, Stroller, ParentArms, ParentBed }
```

#### 2. Diaper Tracking
**User Stories**:
- One-tap logging (Wet/Soiled/Both/Dry)
- Daily count vs medical standards (8+ good, 5-7 warning, <5 alert)
- Historical calendar view
- Daily/weekly stats
- Export for pediatrician

**API Endpoints**:
```
POST   /api/v1/babies/{babyId}/diapers
GET    /api/v1/babies/{babyId}/diapers?date={date}
GET    /api/v1/babies/{babyId}/diapers/statistics
GET    /api/v1/babies/{babyId}/diapers/compare-standards
```

**Data Model**:
```csharp
public class DiaperChange
{
    public Guid Id { get; set; }
    public Guid BabyId { get; set; }
    public DateTime Timestamp { get; set; }
    public DiaperType Type { get; set; } // Wet, Soiled, Both, Dry
    public string? Notes { get; set; }
    public Guid RecordedBy { get; set; }
}

public enum DiaperType { Wet, Soiled, Both, Dry }
```

#### 3. Feeding Tracking with Smart Reminders
**User Stories**:
- Active timer during feeding
- Track type (Breastfeeding L/R/Both, Bottle, Formula)
- Record duration and amount
- Smart reminders based on patterns
- See "next feeding due" countdown

**API Endpoints**:
```
POST   /api/v1/babies/{babyId}/feedings
GET    /api/v1/babies/{babyId}/feedings
GET    /api/v1/babies/{babyId}/feedings/{id}
PUT    /api/v1/babies/{babyId}/feedings/{id}
DELETE /api/v1/babies/{babyId}/feedings/{id}
GET    /api/v1/babies/{babyId}/feedings/last
GET    /api/v1/babies/{babyId}/feedings/next-due
GET    /api/v1/babies/{babyId}/feedings/statistics
POST   /api/v1/babies/{babyId}/feedings/reminders
```

**Data Model**:
```csharp
public class Feeding
{
    public Guid Id { get; set; }
    public Guid BabyId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public FeedingType Type { get; set; } // Breastfeeding, Bottle, Formula
    public BreastSide? Side { get; set; } // Left, Right, Both (nullable for bottle)
    public decimal? AmountMl { get; set; }
    public string? Notes { get; set; }
    public Guid RecordedBy { get; set; }
}

public enum FeedingType { Breastfeeding, Bottle, Formula }
public enum BreastSide { Left, Right, Both }
```

#### 4. Weight & Growth Tracking
**User Stories**:
- Log weight, length, head circumference
- View WHO/CDC growth percentile charts
- See growth trends
- Export for pediatrician

**API Endpoints**:
```
POST   /api/v1/babies/{babyId}/weight
GET    /api/v1/babies/{babyId}/weight
GET    /api/v1/babies/{babyId}/weight/charts
GET    /api/v1/babies/{babyId}/weight/percentiles
```

**Data Model**:
```csharp
public class WeightRecord
{
    public Guid Id { get; set; }
    public Guid BabyId { get; set; }
    public DateTime MeasuredAt { get; set; }
    public decimal WeightKg { get; set; }
    public decimal? LengthCm { get; set; }
    public decimal? HeadCircumferenceCm { get; set; }
    public string? Notes { get; set; }
    public Guid RecordedBy { get; set; }
}
```

#### 5. Baby Profile Management
**User Stories**:
- Create/update baby profile
- Store birth info (date, weight, length)
- Upload photo
- Multiple babies per family

**API Endpoints**:
```
POST   /api/v1/babies
GET    /api/v1/babies/{id}
PUT    /api/v1/babies/{id}
DELETE /api/v1/babies/{id}
GET    /api/v1/families/{familyId}/babies
```

**Data Model**:
```csharp
public class Baby
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public Gender Gender { get; set; }
    public decimal BirthWeightKg { get; set; }
    public decimal BirthLengthCm { get; set; }
    public string? PhotoUrl { get; set; }
    public Guid FamilyId { get; set; }
}

public enum Gender { Male, Female, Other }
```

#### 6. Dashboard with Quick Actions
**User Stories**:
- See all key metrics at a glance
- Quick action buttons (one-tap logging)
- Last feeding with countdown
- Today's diaper count
- Active sleep session if any

**API Endpoints**:
```
GET    /api/v1/babies/{babyId}/dashboard
```

### Phase 2: Enhanced Features

#### 7. Medicine Tracking with Dosage Calculator
**User Stories**:
- Track medications with schedule
- Weight-based dosage calculation
- Safety checks (max dose, minimum time between)
- Dose reminders

**API Endpoints**:
```
GET    /api/v1/babies/{babyId}/medications
POST   /api/v1/babies/{babyId}/medications
POST   /api/v1/babies/{babyId}/medications/{id}/doses
GET    /api/v1/babies/{babyId}/medications/calculate-dosage?weight={kg}&medicineId={id}
```

**Data Model**:
```csharp
public class Medication
{
    public Guid Id { get; set; }
    public Guid BabyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal DosagePerKg { get; set; }
    public string Unit { get; set; } = string.Empty; // ml, mg, etc.
    public TimeSpan Frequency { get; set; }
    public List<MedicationDose> Doses { get; set; } = new();
}

public class MedicationDose
{
    public Guid Id { get; set; }
    public Guid MedicationId { get; set; }
    public DateTime ScheduledTime { get; set; }
    public DateTime? ActualTime { get; set; }
    public decimal Amount { get; set; }
    public Guid? GivenBy { get; set; }
}
```

#### 8. Pump Tracking & Breast Milk Management
**User Stories**:
- Track pumping sessions
- Log output per breast
- Manage milk inventory (fridge/freezer)
- Expiration reminders (4hr room, 4 day fridge, 6mo freezer)

**API Endpoints**:
```
POST   /api/v1/mothers/pumping
GET    /api/v1/mothers/pumping
GET    /api/v1/mothers/pumping/statistics
GET    /api/v1/mothers/pumping/inventory
GET    /api/v1/mothers/pumping/expiring
```

**Data Model**:
```csharp
public class PumpingSession
{
    public Guid Id { get; set; }
    public Guid MotherId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public decimal LeftBreastAmount { get; set; }
    public decimal RightBreastAmount { get; set; }
    public bool StoredInFreezer { get; set; }
    public DateTime? ExpirationDate { get; set; }
}
```

#### 9. Photos, Milestones & Memories
**User Stories**:
- Attach photos to activities
- Record milestones (first smile, rolled over, etc.)
- Timeline view
- Export to photo book

**API Endpoints**:
```
POST   /api/v1/babies/{babyId}/photos
GET    /api/v1/babies/{babyId}/photos
POST   /api/v1/babies/{babyId}/milestones
GET    /api/v1/babies/{babyId}/milestones
GET    /api/v1/babies/{babyId}/timeline
```

**Data Model**:
```csharp
public class BabyPhoto
{
    public Guid Id { get; set; }
    public Guid BabyId { get; set; }
    public string PhotoUrl { get; set; } = string.Empty;
    public DateTime TakenAt { get; set; }
    public string? Caption { get; set; }
    public Guid? MilestoneId { get; set; }
}

public class Milestone
{
    public Guid Id { get; set; }
    public Guid BabyId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime AchievedAt { get; set; }
    public MilestoneCategory Category { get; set; }
}

public enum MilestoneCategory { Physical, Social, Cognitive, Feeding, Health, Custom }
```

#### 10. Emergency Contacts & Quick Access
**User Stories**:
- Store pediatrician and emergency contacts
- One-tap calling
- Priority ordering

**API Endpoints**:
```
GET    /api/v1/emergency-contacts
POST   /api/v1/emergency-contacts
PUT    /api/v1/emergency-contacts/{id}
GET    /api/v1/pediatrician-info
```

**Data Model**:
```csharp
public class EmergencyContact
{
    public Guid Id { get; set; }
    public Guid FamilyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public int Priority { get; set; } // 1 = highest
    public ContactType Type { get; set; }
}

public enum ContactType { Pediatrician, Hospital, PoisonControl, LactationConsultant, Family, Other }
```

#### 11. Family Hub & Multi-Caregiver Support
**User Stories**:
- Multiple guardians per family
- Activity feed (who did what)
- Role-based permissions
- Invite family members

**API Endpoints**:
```
GET    /api/v1/families/{familyId}/members
POST   /api/v1/families/{familyId}/members/invite
PUT    /api/v1/families/{familyId}/members/{userId}/permissions
GET    /api/v1/families/{familyId}/activity-feed
```

**Data Model**:
```csharp
public class Family
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<FamilyMember> Members { get; set; } = new();
}

public class FamilyMember
{
    public Guid UserId { get; set; }
    public Guid FamilyId { get; set; }
    public FamilyRole Role { get; set; }
}

public enum FamilyRole { PrimaryCaregiver, SecondaryCaregiver, ViewOnly }
```

#### 12. Mother Recovery & Mental Health
**User Stories**:
- Track postpartum mood (Edinburgh scale)
- Recovery checklist
- Exercise logging
- Crisis hotline access

**API Endpoints**:
```
POST   /api/v1/mothers/mood-logs
GET    /api/v1/mothers/mood-logs
GET    /api/v1/mothers/recovery-checklist
PUT    /api/v1/mothers/recovery-checklist/{itemId}
```

**Data Model**:
```csharp
public class MoodLog
{
    public Guid Id { get; set; }
    public Guid MotherId { get; set; }
    public DateTime LoggedAt { get; set; }
    public int MoodScore { get; set; } // 1-10
    public string? Notes { get; set; }
    public bool IsPrivate { get; set; }
}
```

### Phase 3: Monitor Integration

#### 13. Bluetooth Baby Monitor
**User Stories**:
- Pair Bluetooth monitor device
- Live audio/video streaming
- Room temperature display
- Soothing features (white noise, lullabies)

**API Endpoints**:
```
POST   /api/v1/monitors/pair
GET    /api/v1/monitors/{deviceId}/stream
POST   /api/v1/monitors/{deviceId}/play-sound
```

## Architecture Patterns

### Clean Architecture Layers

```
┌─────────────────────────────────────┐
│       Presentation Layer            │
│  (BabyChloe.API - Controllers)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Application Layer              │
│  (Commands, Queries, Handlers)     │
│  - CQRS with MediatR               │
│  - DTOs, Mappers                   │
│  - Validation (FluentValidation)   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Domain Layer                │
│  (Business Logic & Rules)          │
│  - Entities (Baby, Feeding, etc.)  │
│  - Value Objects (Weight, Length)  │
│  - Domain Events                   │
│  - Repository Interfaces           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Infrastructure Layer            │
│  (External Concerns)               │
│  - EF Core Repositories            │
│  - PostgreSQL DbContext            │
│  - Redis Caching                   │
│  - SignalR Hubs                    │
│  - External APIs                   │
└─────────────────────────────────────┘
```

### Design Patterns Implementation

#### CQRS with MediatR
```csharp
// Command
public record CreateBabyCommand(string Name, DateTime BirthDate, ...) : IRequest<BabyDto>;

// Handler
public class CreateBabyCommandHandler : IRequestHandler<CreateBabyCommand, BabyDto>
{
    public async Task<BabyDto> Handle(CreateBabyCommand request, CancellationToken ct)
    {
        var baby = Baby.Create(request.Name, request.BirthDate, ...);
        await _repository.AddAsync(baby, ct);
        return _mapper.Map<BabyDto>(baby);
    }
}

// Query
public record GetBabyByIdQuery(Guid BabyId) : IRequest<BabyDto>;
```

#### Repository Pattern
```csharp
public interface IBabyRepository
{
    Task<Baby?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Baby> AddAsync(Baby baby, CancellationToken ct = default);
    Task UpdateAsync(Baby baby, CancellationToken ct = default);
}
```

#### Unit of Work
```csharp
public interface IUnitOfWork : IDisposable
{
    IBabyRepository Babies { get; }
    IDiaperChangeRepository DiaperChanges { get; }
    IFeedingRepository Feedings { get; }
    
    Task<int> SaveChangesAsync(CancellationToken ct = default);
    Task BeginTransactionAsync(CancellationToken ct = default);
    Task CommitTransactionAsync(CancellationToken ct = default);
}
```

#### Domain Events
```csharp
public class BabyFedEvent : DomainEvent
{
    public Guid BabyId { get; }
    public Guid FeedingId { get; }
    
    public BabyFedEvent(Guid babyId, Guid feedingId)
    {
        BabyId = babyId;
        FeedingId = feedingId;
    }
}

// Handler
public class UpdateFeedingReminderHandler : INotificationHandler<BabyFedEvent>
{
    public async Task Handle(BabyFedEvent notification, CancellationToken ct)
    {
        await _reminderService.RecalculateNextReminderAsync(notification.BabyId, ct);
    }
}
```

### Resilience Patterns with Polly

```csharp
public static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .WaitAndRetryAsync(
            retryCount: 3,
            sleepDurationProvider: retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))
        );
}

public static IAsyncPolicy<HttpResponseMessage> GetCircuitBreakerPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .CircuitBreakerAsync(
            handledEventsAllowedBeforeBreaking: 5,
            durationOfBreak: TimeSpan.FromSeconds(30)
        );
}
```

### Health Checks

```csharp
services.AddHealthChecks()
    .AddNpgSql(connectionString)
    .AddRedis(redisConnectionString)
    .AddSignalRHub(hubUrl)
    .AddCheck<BabyMonitorHealthCheck>();

// Endpoints
app.UseHealthChecks("/health");
app.UseHealthChecks("/health/ready"); // Readiness probe
app.UseHealthChecks("/health/live");  // Liveness probe
```

### Background Services

```csharp
public class ReminderProcessingService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await ProcessRemindersAsync(stoppingToken);
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
```

## Security Requirements

### Authentication & Authorization
- OAuth 2.0 / OpenID Connect
- JWT access tokens (15-minute expiry)
- Refresh tokens (30-day expiry)
- Role-based access control (RBAC)
- Azure Key Vault for secrets

### Data Protection
- HTTPS only (TLS 1.3)
- Encrypted at rest (PostgreSQL encryption)
- Encrypted in transit
- Certificate pinning in mobile app
- SQL injection prevention (parameterized queries)
- XSS protection headers
- CSRF tokens

### Privacy
- GDPR compliant
- Data export on request
- Complete data deletion
- Granular consent management
- No third-party analytics or tracking

## Testing Strategy

### Unit Tests (80% coverage)
- Domain logic testing
- Command/Query handler testing
- Repository mocking with Moq
- xUnit test framework

### Integration Tests
- API endpoint testing
- Database integration
- Redis integration
- SignalR hub testing

### E2E Tests
- Mobile UI automation with Appium
- Critical user flows
- Cross-platform testing (iOS, Android)

## Deployment

### Backend (Azure)
- Azure App Service (Web API)
- Azure Database for PostgreSQL
- Azure Cache for Redis
- Azure SignalR Service
- Azure Blob Storage (photos)
- Azure Key Vault (secrets)
- Application Insights (monitoring)

### Mobile
- App Store (iOS)
- Google Play Store (Android)
- Microsoft Store (Windows - optional)

## Success Criteria

### Technical Excellence
- Clean Architecture implemented correctly
- CQRS pattern with MediatR
- 80%+ test coverage
- All resilience patterns working
- Health checks operational
- No critical security vulnerabilities

### User Experience
- One-tap actions working flawlessly
- Voice commands functional
- Dark mode beautiful and usable
- Offline mode seamless
- Loving language throughout
- Partner collaboration smooth
- Emergency access instant
- No ads, no tracking, privacy respected

### Business Goals
- Parents feel supported, not stressed
- Actually useful for daily baby care
- Strong portfolio piece for Microsoft interviews
- Demonstrates production-ready patterns

## Implementation Priority

### Sprint 1 (2 weeks) - Foundation
- [ ] Project structure (Clean Architecture)
- [ ] Database setup (PostgreSQL + EF Core)
- [ ] Authentication & JWT
- [ ] Baby profile CRUD
- [ ] Basic API versioning
- [ ] Health checks

### Sprint 2 (2 weeks) - Core Tracking
- [ ] Sleep tracking (CRITICAL)
- [ ] Diaper tracking
- [ ] Feeding tracking
- [ ] Weight tracking
- [ ] Dashboard API

### Sprint 3 (2 weeks) - Mobile MVP
- [ ] .NET MAUI project setup
- [ ] MVVM ViewModels
- [ ] Sleep logging UI
- [ ] Diaper logging UI
- [ ] Feeding timer UI
- [ ] Offline sync

### Sprint 4 (2 weeks) - Smart Features
- [ ] Reminder system
- [ ] Pattern analysis
- [ ] Insights engine
- [ ] Push notifications
- [ ] Background services

### Sprint 5 (2 weeks) - Enhanced Features
- [ ] Medicine tracking
- [ ] Pump tracking
- [ ] Photos & milestones
- [ ] Emergency contacts
- [ ] Family collaboration

### Sprint 6 (2 weeks) - Polish & Deploy
- [ ] Dark mode refinement
- [ ] Voice commands
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Production deployment

## Notes for Implementation

### Critical Reminders
1. **ConfigureAwait(false)** in all library code
2. **CancellationToken** in all async methods
3. **Nullable reference types** enabled
4. **One-handed operation** in UI design
5. **Loving language** in all user-facing text
6. **Offline-first** architecture
7. **Privacy by design** - no tracking

### Common Pitfalls to Avoid
- ❌ Using .Result or .Wait() (causes deadlocks)
- ❌ Async void methods (except event handlers)
- ❌ Missing ConfigureAwait in library code
- ❌ Alarming notification language
- ❌ Requiring internet for core features
- ❌ Two-handed UI interactions
- ❌ Bright colors in dark mode

### Success Indicators
- ✅ Exhausted parent can log with one hand
- ✅ 3 AM dark mode doesn't wake partner
- ✅ App works perfectly without internet
- ✅ No console.log statements in production
- ✅ Health checks return 200 OK
- ✅ All tests passing
- ✅ No critical vulnerabilities
- ✅ Parents actually use it daily

---

This specification combines technical excellence with genuine empathy for new parents. Every feature serves both as a showcase of Microsoft engineering best practices and as a practical tool to make parenting a little easier during the most challenging time.
