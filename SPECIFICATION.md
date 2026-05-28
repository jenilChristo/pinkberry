# Baby Chloe - Baby Tracking Application Specification

## Executive Summary
A comprehensive baby tracking application designed to help new parents monitor their baby's health metrics, feeding schedules, and developmental milestones while supporting maternal recovery. Built with enterprise-grade design patterns suitable for technical interviews.

## Technical Stack

### Backend API
- **Language**: C# (.NET 8+)
- **Framework**: ASP.NET Core Web API
- **Architecture**: Clean Architecture / Onion Architecture
- **Database**: 
  - Primary: PostgreSQL (relational data)
  - Cache: Redis (real-time data, reminders)
  - Time-series: TimescaleDB (health metrics tracking)
- **Authentication**: OAuth 2.0 + JWT
- **Real-time**: SignalR (video streaming, notifications)

### Frontend Mobile
- **Framework**: .NET MAUI with Fluent UI components
- **UI Library**: Microsoft Fluent UI for MAUI
- **State Management**: MVVM pattern with CommunityToolkit.Mvvm
- **Local Storage**: SQLite
- **Offline Support**: Sync layer with conflict resolution
- **Voice Commands**: Hands-free logging via speech recognition
  - "Log diaper change wet"
  - "Start feeding left breast"
  - "Baby woke up"
  - "Log medicine given"
- **Wearable Support**:
  - Apple Watch complications (feeding timer, diaper count)
  - WearOS tiles for quick logging
  - Haptic feedback for reminders

### Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Kubernetes (optional for scalability)
- **CI/CD**: GitHub Actions / Azure DevOps
- **Cloud**: Azure (App Service, Blob Storage, Notification Hub)
- **Monitoring**: Application Insights, Serilog, Health Checks UI
- **Resilience**: Polly for retry policies and circuit breakers
- **Rate Limiting**: AspNetCoreRateLimit middleware
- **API Gateway**: Azure API Management (production)
- **Secret Management**: Azure Key Vault

## Design Patterns to Implement

### Architectural Patterns
1. **Clean Architecture**
   - Domain Layer (Entities, Value Objects, Domain Events)
   - Application Layer (Use Cases, Interfaces, DTOs)
   - Infrastructure Layer (Data Access, External Services)
   - Presentation Layer (API Controllers, UI)

2. **CQRS (Command Query Responsibility Segregation)**
   - Separate read and write operations
   - Optimize queries for reporting
   - Event sourcing for audit trails
   - Materialized views for complex queries

3. **Repository Pattern**
   - Abstract data access layer
   - Unit of Work for transactions
   - Specification pattern for complex queries

4. **Mediator Pattern**
   - MediatR library for command/query handling
   - Decoupled request/response flow
   - Pipeline behaviors for cross-cutting concerns

5. **Resilience Patterns** (Using Polly)
   - Retry policies with exponential backoff
   - Circuit breaker for external dependencies
   - Timeout policies
   - Bulkhead isolation for critical resources
   - Fallback strategies

6. **Background Services**
   - IHostedService for scheduled tasks
   - Hangfire for recurring jobs
   - Reminder notifications processing
   - Data cleanup and archival
   - Analytics aggregation

### Behavioral Patterns
1. **Strategy Pattern** - Different reminder strategies (time-based, interval-based)
2. **Observer Pattern** - Push notifications for reminders
3. **Chain of Responsibility** - Health metric validation pipeline
4. **State Pattern** - Baby activity states (feeding, sleeping, awake)

### Creational Patterns
1. **Factory Pattern** - Create different types of tracking records
2. **Builder Pattern** - Complex entity construction (reports, statistics)
3. **Singleton Pattern** - Configuration services, logging

### Structural Patterns
1. **Adapter Pattern** - Bluetooth device integration
2. **Facade Pattern** - Simplify complex subsystems
3. **Decorator Pattern** - Add responsibilities to objects dynamically

## Microsoft Engineering Best Practices

### Async/Await Patterns
```csharp
// Always use ConfigureAwait(false) in library code
public async Task<Baby> GetBabyAsync(Guid id, CancellationToken ct = default)
{
    var baby = await _repository.GetByIdAsync(id, ct).ConfigureAwait(false);
    return baby;
}

// Avoid async void (except event handlers)
public async Task ProcessReminderAsync() { }  // ✓ Good
// public async void ProcessReminder() { }    // ✗ Bad

// Use CancellationToken for long-running operations
public async Task<List<Baby>> GetBabiesAsync(CancellationToken ct = default)
{
    ct.ThrowIfCancellationRequested();
    return await _repository.GetAllAsync(ct).ConfigureAwait(false);
}
```

### Nullable Reference Types (C# 12)
```csharp
#nullable enable

public class Baby
{
    public Guid Id { get; init; }
    public string Name { get; set; } = string.Empty; // Non-nullable
    public string? Nickname { get; set; }             // Nullable
    public DateTime BirthDate { get; set; }
}

// Repository methods
Task<Baby?> GetByIdAsync(Guid id, CancellationToken ct = default);
Task<List<Baby>> GetAllAsync(CancellationToken ct = default); // Never null list
```

### Health Checks Implementation
```csharp
// Startup.cs / Program.cs
builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString, name: "postgresql", tags: new[] { "db", "ready" })
    .AddRedis(redisConnection, name: "redis", tags: new[] { "cache", "ready" })
    .AddSignalRHub("<hub-url>", name: "signalr", tags: new[] { "realtime" })
    .AddCheck<BabyMonitorHealthCheck>("baby-monitor", tags: new[] { "external" });

// Health check endpoints
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false // Just checks if app is running
});
```

### Resilience with Polly
```csharp
// Configure retry policy for external API calls
builder.Services.AddHttpClient<IGrowthChartService, GrowthChartService>()
    .AddPolicyHandler(GetRetryPolicy())
    .AddPolicyHandler(GetCircuitBreakerPolicy());

static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .OrResult(msg => msg.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
        .WaitAndRetryAsync(
            retryCount: 3,
            sleepDurationProvider: retryAttempt => 
                TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)), // Exponential backoff
            onRetry: (outcome, timespan, retryAttempt, context) =>
            {
                Log.Warning("Retry {RetryAttempt} after {Delay}s", retryAttempt, timespan.TotalSeconds);
            });
}

static IAsyncPolicy<HttpResponseMessage> GetCircuitBreakerPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .CircuitBreakerAsync(
            handledEventsAllowedBeforeBreaking: 5,
            durationOfBreak: TimeSpan.FromSeconds(30),
            onBreak: (outcome, duration) =>
            {
                Log.Error("Circuit breaker opened for {Duration}s", duration.TotalSeconds);
            },
            onReset: () =>
            {
                Log.Information("Circuit breaker reset");
            });
}
```

### Background Services
```csharp
public class ReminderProcessingService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ReminderProcessingService> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromMinutes(1);

    public ReminderProcessingService(
        IServiceProvider serviceProvider,
        ILogger<ReminderProcessingService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Reminder Processing Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var reminderService = scope.ServiceProvider
                    .GetRequiredService<IReminderService>();

                await reminderService.ProcessDueRemindersAsync(stoppingToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing reminders");
            }

            await Task.Delay(_interval, stoppingToken).ConfigureAwait(false);
        }

        _logger.LogInformation("Reminder Processing Service stopped");
    }
}

// Register in Program.cs
builder.Services.AddHostedService<ReminderProcessingService>();
```

### Telemetry & Monitoring
```csharp
// Application Insights setup
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
    options.EnableAdaptiveSampling = true;
    options.EnablePerformanceCounterCollectionModule = true;
});

// Custom telemetry
public class FeedingService
{
    private readonly TelemetryClient _telemetry;
    
    public async Task RecordFeedingAsync(Feeding feeding)
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            await _repository.AddAsync(feeding);
            
            // Track custom event
            _telemetry.TrackEvent("FeedingRecorded", new Dictionary<string, string>
            {
                { "BabyId", feeding.BabyId.ToString() },
                { "Type", feeding.Type.ToString() },
                { "Duration", (feeding.EndTime - feeding.StartTime)?.TotalMinutes.ToString() ?? "0" }
            });
        }
        catch (Exception ex)
        {
            _telemetry.TrackException(ex);
            throw;
        }
        finally
        {
            stopwatch.Stop();
            _telemetry.TrackMetric("FeedingRecordDuration", stopwatch.ElapsedMilliseconds);
        }
    }
}
```

### Structured Logging with Serilog
```csharp
// Program.cs
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("System", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "BabyChloe.API")
    .Enrich.WithMachineName()
    .WriteTo.Console(
        outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.ApplicationInsights(
        builder.Configuration["ApplicationInsights:ConnectionString"],
        TelemetryConverter.Traces)
    .WriteTo.File(
        path: "logs/babychloe-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 7)
    .CreateLogger();

builder.Host.UseSerilog();

// Usage in controllers
_logger.LogInformation(
    "Baby {BabyId} feeding recorded by {UserId} at {Timestamp}",
    feeding.BabyId,
    userId,
    DateTime.UtcNow);
```

### API Versioning
```csharp
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = ApiVersionReader.Combine(
        new UrlSegmentApiVersionReader(),
        new HeaderApiVersionReader("X-Api-Version"));
});

// Controller
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class BabiesController : ControllerBase { }

[ApiVersion("2.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class BabiesV2Controller : ControllerBase { }
```

### Rate Limiting
```csharp
// appsettings.json
{
  "IpRateLimiting": {
    "EnableEndpointRateLimiting": true,
    "StackBlockedRequests": false,
    "RealIpHeader": "X-Real-IP",
    "ClientIdHeader": "X-ClientId",
    "HttpStatusCode": 429,
    "GeneralRules": [
      {
        "Endpoint": "*",
        "Period": "1m",
        "Limit": 100
      },
      {
        "Endpoint": "*",
        "Period": "1h",
        "Limit": 1000
      }
    ]
  }
}

// Program.cs
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(
    builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

app.UseIpRateLimiting();
```

### Global Exception Handling
```csharp
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (NotFoundException ex)
        {
            await HandleExceptionAsync(context, ex, StatusCodes.Status404NotFound);
        }
        catch (ValidationException ex)
        {
            await HandleExceptionAsync(context, ex, StatusCodes.Status400BadRequest);
        }
        catch (UnauthorizedAccessException ex)
        {
            await HandleExceptionAsync(context, ex, StatusCodes.Status401Unauthorized);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred");
            await HandleExceptionAsync(context, ex, StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task HandleExceptionAsync(
        HttpContext context,
        Exception exception,
        int statusCode)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var response = new
        {
            StatusCode = statusCode,
            Message = exception.Message,
            Detailed = exception.ToString() // Only in Development
        };

        await context.Response.WriteAsJsonAsync(response);
    }
}

// Register in Program.cs
app.UseMiddleware<GlobalExceptionMiddleware>();
```

### Pagination Best Practices
```csharp
public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPrevious => PageNumber > 1;
    public bool HasNext => PageNumber < TotalPages;
}

// Controller
[HttpGet]
public async Task<ActionResult<PagedResult<BabyDto>>> GetBabies(
    [FromQuery] int pageNumber = 1,
    [FromQuery] int pageSize = 20,
    CancellationToken ct = default)
{
    if (pageSize > 100) pageSize = 100; // Max limit
    
    var query = new GetBabiesQuery(pageNumber, pageSize);
    var result = await _mediator.Send(query, ct);
    
    // Add pagination headers
    Response.Headers.Add("X-Pagination", JsonSerializer.Serialize(new
    {
        result.TotalCount,
        result.PageSize,
        result.TotalPages,
        result.HasNext,
        result.HasPrevious
    }));
    
    return Ok(result);
}
```

## API Design (RESTful)

### API Principles
- RESTful resource-based URLs
- HTTP verbs (GET, POST, PUT, PATCH, DELETE)
- Hypermedia (HATEOAS) for navigation
- Versioning (URL-based: /api/v1/)
- Pagination, filtering, sorting
- Rate limiting and throttling

### Core Endpoints

#### Authentication & User Management
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
GET    /api/v1/users/profile
PUT    /api/v1/users/profile
POST   /api/v1/users/family/invite
```

#### Baby Profiles
```
GET    /api/v1/babies
POST   /api/v1/babies
GET    /api/v1/babies/{id}
PUT    /api/v1/babies/{id}
DELETE /api/v1/babies/{id}
PATCH  /api/v1/babies/{id}
```

#### Diaper Tracking
```
GET    /api/v1/babies/{babyId}/diapers
POST   /api/v1/babies/{babyId}/diapers
GET    /api/v1/babies/{babyId}/diapers/{id}
DELETE /api/v1/babies/{babyId}/diapers/{id}
GET    /api/v1/babies/{babyId}/diapers/statistics?startDate={date}&endDate={date}
GET    /api/v1/babies/{babyId}/diapers/daily-summary/{date}
GET    /api/v1/babies/{babyId}/diapers/compare-standards
```

#### Feeding Tracking
```
GET    /api/v1/babies/{babyId}/feedings
POST   /api/v1/babies/{babyId}/feedings
GET    /api/v1/babies/{babyId}/feedings/{id}
PUT    /api/v1/babies/{babyId}/feedings/{id}
DELETE /api/v1/babies/{babyId}/feedings/{id}
GET    /api/v1/babies/{babyId}/feedings/last
GET    /api/v1/babies/{babyId}/feedings/next-due
POST   /api/v1/babies/{babyId}/feedings/reminders
PUT    /api/v1/babies/{babyId}/feedings/reminders/{id}
```

#### Weight Tracking
```
GET    /api/v1/babies/{babyId}/weight
POST   /api/v1/babies/{babyId}/weight
GET    /api/v1/babies/{babyId}/weight/{id}
DELETE /api/v1/babies/{babyId}/weight/{id}
GET    /api/v1/babies/{babyId}/weight/growth-chart
GET    /api/v1/babies/{babyId}/weight/compare-standards?standard={WHO|CDC}
GET    /api/v1/babies/{babyId}/weight/percentile
```

#### Baby Monitor Integration
```
GET    /api/v1/babies/{babyId}/monitor/devices
POST   /api/v1/babies/{babyId}/monitor/devices/pair
DELETE /api/v1/babies/{babyId}/monitor/devices/{deviceId}
GET    /api/v1/babies/{babyId}/monitor/stream (SignalR WebSocket)
POST   /api/v1/babies/{babyId}/monitor/recordings
GET    /api/v1/babies/{babyId}/monitor/recordings/{id}
```

#### Sleep Tracking (Critical for Parents)
```
POST   /api/v1/babies/{babyId}/sleep
GET    /api/v1/babies/{babyId}/sleep
GET    /api/v1/babies/{babyId}/sleep/active
PUT    /api/v1/babies/{babyId}/sleep/{id}/end
GET    /api/v1/babies/{babyId}/sleep/statistics
GET    /api/v1/babies/{babyId}/sleep/patterns
GET    /api/v1/babies/{babyId}/sleep/insights
```

#### Medicine Tracking
```
GET    /api/v1/babies/{babyId}/medications
POST   /api/v1/babies/{babyId}/medications
GET    /api/v1/babies/{babyId}/medications/{id}
PUT    /api/v1/babies/{babyId}/medications/{id}
DELETE /api/v1/babies/{babyId}/medications/{id}
POST   /api/v1/babies/{babyId}/medications/{id}/doses
GET    /api/v1/babies/{babyId}/medications/{id}/schedule
GET    /api/v1/babies/{babyId}/medications/calculate-dosage
```

#### Pump Tracking (Breastfeeding Support)
```
POST   /api/v1/mothers/pumping
GET    /api/v1/mothers/pumping
GET    /api/v1/mothers/pumping/{id}
DELETE /api/v1/mothers/pumping/{id}
GET    /api/v1/mothers/pumping/statistics
GET    /api/v1/mothers/pumping/inventory
```

#### Mother Recovery
```
GET    /api/v1/mothers/profile
PUT    /api/v1/mothers/profile
POST   /api/v1/mothers/mood-log
GET    /api/v1/mothers/mood-log
GET    /api/v1/mothers/recovery-checklist
PUT    /api/v1/mothers/recovery-checklist/{itemId}
GET    /api/v1/mothers/exercises
POST   /api/v1/mothers/exercises/track
GET    /api/v1/mothers/appointments
POST   /api/v1/mothers/appointments
```

#### Family & Caregivers
```
GET    /api/v1/families/{familyId}/members
POST   /api/v1/families/{familyId}/members/invite
DELETE /api/v1/families/{familyId}/members/{userId}
PUT    /api/v1/families/{familyId}/members/{userId}/permissions
GET    /api/v1/families/{familyId}/activity-feed
```

#### Photos & Milestones
```
POST   /api/v1/babies/{babyId}/photos
GET    /api/v1/babies/{babyId}/photos
DELETE /api/v1/babies/{babyId}/photos/{id}
POST   /api/v1/babies/{babyId}/milestones
GET    /api/v1/babies/{babyId}/milestones
GET    /api/v1/babies/{babyId}/timeline
```

#### Emergency & Quick Access
```
GET    /api/v1/emergency-contacts
POST   /api/v1/emergency-contacts
PUT    /api/v1/emergency-contacts/{id}
DELETE /api/v1/emergency-contacts/{id}
GET    /api/v1/pediatrician-info
```

#### Health Checks (Microsoft Best Practice)
```
GET    /health
GET    /health/ready
GET    /health/live
GET    /health/startup
```

#### Analytics & Reports
```
GET    /api/v1/babies/{babyId}/dashboard
GET    /api/v1/babies/{babyId}/reports/daily?date={date}
GET    /api/v1/babies/{babyId}/reports/weekly?weekStart={date}
GET    /api/v1/babies/{babyId}/reports/monthly?month={month}&year={year}
POST   /api/v1/babies/{babyId}/reports/export (PDF/CSV)
GET    /api/v1/babies/{babyId}/reports/pediatrician (Beautiful PDF for doctor visits)
GET    /api/v1/babies/{babyId}/insights/patterns
GET    /api/v1/babies/{babyId}/insights/encouragement (Daily positive messages)
```

## Data Models

### Core Entities

#### Baby Profile
```csharp
public class Baby
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public DateTime BirthDate { get; set; }
    public string Gender { get; set; }
    public decimal BirthWeight { get; set; } // in kg
    public decimal BirthLength { get; set; } // in cm
    public string PhotoUrl { get; set; }
    public List<Guardian> Guardians { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

#### Diaper Change Record
```csharp
public class DiaperChange
{
    public Guid Id { get; set; }
    public Guid BabyId { get; set; }
    public DateTime Timestamp { get; set; }
    public DiaperType Type { get; set; } // Wet, Soiled, Both
    public string Notes { get; set; }
    public Guid RecordedBy { get; set; }
}

public enum DiaperType
{
    Wet,
    Soiled,
    Both,
    Dry
}
```

#### Feeding Record
```csharp
public class Feeding
{
    public Guid Id { get; set; }
    public Guid BabyId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public FeedingType Type { get; set; }
    public decimal? Amount { get; set; } // in ml for bottle
    public FeedingSide? Side { get; set; } // for breastfeeding
    public string Notes { get; set; }
    public Guid RecordedBy { get; set; }
}

public enum FeedingType
{
    Breastfeeding,
    Bottle,
    Formula,
    Solids
}

public enum FeedingSide
{
    Left,
    Right,
    Both
}
```

#### Weight Record
```csharp
public class WeightRecord
{
    public Guid Id { get; set; }
    public Guid BabyId { get; set; }
    public DateTime MeasuredAt { get; set; }
    public decimal Weight { get; set; } // in kg
    public decimal? Length { get; set; } // in cm
    public decimal? HeadCircumference { get; set; } // in cm
    public string Notes { get; set; }
    public Guid RecordedBy { get; set; }
}
```

#### Reminder
```csharp
public class Reminder
{
    public Guid Id { get; set; }
    public Guid BabyId { get; set; }
    public ReminderType Type { get; set; }
    public DateTime NextDueTime { get; set; }
    public TimeSpan Interval { get; set; }
    public bool IsEnabled { get; set; }
    public List<NotificationChannel> Channels { get; set; }
}

public enum ReminderType
{
    Feeding,
    Diaper,
    Medicine,
    DoctorAppointment,
    Pumping,
    Sleep,
    Custom
}

#### Sleep Record
```csharp
public class SleepRecord
{
    public Guid Id { get; set; }
    public Guid BabyId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public SleepQuality Quality { get; set; }
    public SleepLocation Location { get; set; } // Crib, Bassinet, Parent Bed
    public bool WasSwaddled { get; set; }
    public string Notes { get; set; }
    public Guid RecordedBy { get; set; }
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
```

#### Medication
```csharp
public class Medication
{
    public Guid Id { get; set; }
    public Guid BabyId { get; set; }
    public string Name { get; set; }
    public string Purpose { get; set; }
    public decimal DosagePerKg { get; set; } // for weight-based dosing
    public decimal FixedDosage { get; set; } // for fixed dosing
    public string Unit { get; set; } // ml, mg, tablets
    public TimeSpan Frequency { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<MedicationDose> Doses { get; set; }
    public bool IsActive { get; set; }
}

public class MedicationDose
{
    public Guid Id { get; set; }
    public Guid MedicationId { get; set; }
    public DateTime ScheduledTime { get; set; }
    public DateTime? ActualTime { get; set; }
    public decimal Amount { get; set; }
    public bool WasGiven { get; set; }
    public string Notes { get; set; }
    public Guid RecordedBy { get; set; }
}
```

#### Pumping Session
```csharp
public class PumpingSession
{
    public Guid Id { get; set; }
    public Guid MotherId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public decimal LeftBreastAmount { get; set; } // in ml
    public decimal RightBreastAmount { get; set; } // in ml
    public decimal TotalAmount => LeftBreastAmount + RightBreastAmount;
    public bool StoredInFreezer { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public string Notes { get; set; }
}
```

#### Photo & Milestone
```csharp
public class BabyPhoto
{
    public Guid Id { get; set; }
    public Guid BabyId { get; set; }
    public string PhotoUrl { get; set; }
    public string ThumbnailUrl { get; set; }
    public DateTime TakenAt { get; set; }
    public string Caption { get; set; }
    public List<string> Tags { get; set; }
    public Guid? MilestoneId { get; set; }
    public Guid UploadedBy { get; set; }
}

public class Milestone
{
    public Guid Id { get; set; }
    public Guid BabyId { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public DateTime AchievedAt { get; set; }
    public MilestoneCategory Category { get; set; }
    public List<BabyPhoto> Photos { get; set; }
    public Guid RecordedBy { get; set; }
}

public enum MilestoneCategory
{
    Physical, // Rolled over, sat up, crawled, walked
    Social, // First smile, waved, said hi
    Cognitive, // Recognized parents, object permanence
    Feeding, // First solid food, self-fed
    Health, // First tooth, first haircut
    Custom
}
```

#### Emergency Contact
```csharp
public class EmergencyContact
{
    public Guid Id { get; set; }
    public Guid FamilyId { get; set; }
    public string Name { get; set; }
    public string Relationship { get; set; } // Pediatrician, Hospital, Family
    public string PhoneNumber { get; set; }
    public string Email { get; set; }
    public string Address { get; set; }
    public int Priority { get; set; } // 1 = highest
    public string Notes { get; set; }
}
```
```

#### Mother Profile
```csharp
public class MotherProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateTime DeliveryDate { get; set; }
    public DeliveryType DeliveryType { get; set; }
    public List<MoodLog> MoodLogs { get; set; }
    public List<RecoveryChecklistItem> RecoveryChecklist { get; set; }
    public List<Exercise> ExerciseHistory { get; set; }
}

public class MoodLog
{
    public Guid Id { get; set; }
    public DateTime Timestamp { get; set; }
    public int MoodScore { get; set; } // 1-10
    public List<string> Symptoms { get; set; }
    public string Notes { get; set; }
}
```

## Feature Requirements

### 1. Diaper Tracking

#### Core Functionality
- Record diaper changes with timestamp
- Categorize: wet, soiled, both, or dry
- Add optional notes (color, consistency for health monitoring)
- View daily summary with count
- Compare against medical standards (8-12 diapers/day for newborns)
- Alert if count is below recommended range

#### Medical Standards Database
- Age-based recommended diaper change frequency
- WHO/AAP guidelines integration
- Visual indicators (green/yellow/red) for compliance

#### Analytics
- Daily/weekly/monthly statistics
- Pattern recognition (timing clusters)
- Export data for pediatrician visits

### 2. Feeding Tracking & Reminders

#### Core Functionality
- Log feeding start/end times
- Track feeding type (breast, bottle, formula, solids)
- Record amount (for bottle feeding)
- Track breastfeeding side and duration
- Timer function during active feeding
- Quick-log for last feeding

#### Smart Reminders
- Calculate next feeding time based on interval
- Customizable reminder intervals (2, 3, 4 hours)
- Push notifications (local and remote)
- Snooze functionality with smart intervals (10 min, 30 min, 1 hour)
- Adaptive reminders based on feeding patterns
- Night mode (gentle notifications with soft sounds)
- **Loving Language**: "Time for baby's feeding 💙" not "FEEDING OVERDUE!"
- Partner notifications: "Your partner just fed baby"
- **Do Not Disturb** integration (respects system settings)
- Vibration-only option for silent alerts
- Gradual volume increase for notifications
- Customizable notification sounds (lullaby-style)

#### Feeding Insights
- Average time between feedings
- Total daily intake
- Feeding duration trends
- Growth correlation with feeding patterns
- **Encouraging Insights**:
  - "You're doing amazing! Baby had 8 feedings today ✨"
  - "Your baby typically feeds every 2.5 hours during the day"
  - "Feeding pattern looking great this week!"
- **Pattern Recognition**:
  - "Baby usually gets hungry around 10 PM"
  - "Growth spurt detected - increased feeding is normal"
  - "Cluster feeding in evenings - this is common!"
- **Partner Visibility**: Show who fed baby last for coordination

### 3. Bluetooth Baby Monitor Integration

#### Device Pairing
- Scan for nearby Bluetooth Low Energy (BLE) devices
- Support common baby monitor protocols
- Secure pairing process
- Multi-device support

#### Live Video Streaming
- Real-time video feed via SignalR
- Low-latency streaming (<2 seconds)
- Adaptive bitrate based on connection quality
- Background streaming with audio-only mode
- Recording capability (local storage)

#### Monitor Features
- Audio monitoring with waveform visualization
- Room temperature display
- Motion detection alerts
- Two-way audio (talk-back feature)
- Night vision mode
- **Soothing Features** (Mother's Toolkit):
  - White noise player (rain, ocean, fan, heartbeat)
  - Lullaby library with timer
  - Gentle shushing sound
  - Voice recording playback (mom's voice)
  - Volume control and fade-out timer
  - Remote soothing while away from nursery

#### Privacy & Security
- End-to-end encryption for video streams
- Local network streaming (no cloud routing)
- Auto-disconnect after inactivity
- Secure credential storage

### 4. Weight & Growth Tracking

#### Weight Recording
- Manual entry with date/time
- Support for multiple units (kg, lb, g)
- Length/height tracking
- Head circumference tracking
- Photo attachment for visual progress

#### Growth Charts
- Interactive growth curves (WHO, CDC standards)
- Percentile calculation and display
- Gender-specific charts
- Age-adjusted comparisons
- Export charts as images/PDF

#### Health Insights
- Weight gain velocity
- Z-scores calculation
- Deviation alerts from normal ranges
- Milestone predictions
- Integration with feeding data

#### Medical Standards
- WHO Child Growth Standards (0-24 months)
- CDC Growth Charts (24+ months)
- Preterm baby adjusted curves
- Multiple-baby comparisons (twins, siblings)

### 5. Sleep Tracking (Essential for Baby & Parents)

#### Core Functionality
- Log sleep sessions with start/end times
- Active sleep timer with notification when baby wakes
- Track sleep quality (peaceful, restless, fussy)
- Record sleep location and conditions (swaddled, white noise)
- Quick notes for context (teething, growth spurt)

#### Sleep Analytics
- Total daily/nightly sleep duration
- Sleep pattern visualization (timeline view)
- Night waking frequency
- Longest sleep stretch tracking
- Age-appropriate sleep recommendations comparison
- Sleep regression detection

#### Sleep Insights
- "Your baby typically sleeps 2.5 hours after feeding"
- "Bedtime routine appears most successful at 7:30 PM"
- "Sleep improving: 30 minutes longer than last week"
- Correlation with feeding and activity patterns

#### Parent Sleep Tracking (Optional)
- Parent sleep quality logging
- Sleep deprivation alerts
- Co-sleeping safety reminders
- Shift scheduling for couples

### 6. Medicine Tracking with Smart Dosage

#### Core Functionality
- Medication database with common baby medicines
- Weight-based dosage calculator
- Age-based dosage calculator
- Medication schedule with reminders
- Dose administration logging

#### Safety Features
- Maximum daily dose warnings
- Minimum time between doses enforcement
- Allergies and contraindications checking
- Expiration date tracking
- Prescription photo attachment

#### Reminders
- Push notifications for scheduled doses
- "Given" confirmation with timestamp
- Missed dose alerts
- Refill reminders

### 7. Pump Tracking & Breast Milk Management

#### Pumping Sessions
- Timer for pumping sessions
- Track amount per breast
- Session notes (supply up/down, comfort level)
- Pumping schedule and reminders

#### Milk Storage
- Breast milk inventory tracker
- Storage location (fridge, freezer)
- Expiration date calculator (4 hours room temp, 4 days fridge, 6 months freezer)
- First In First Out (FIFO) reminders
- Storage bag labeling templates

#### Supply Tracking
- Daily/weekly output trends
- Supply optimization tips
- Hydration and nutrition reminders
- Correlation with baby's feeding needs

#### Breastfeeding Support
- Lactation consultant contacts
- Common issue troubleshooting
- Support group connections
- Educational resources

### 8. Mother Recovery Support

#### Postpartum Recovery Checklist
- Customizable checklist based on delivery type
- Timed reminders for medications
- Physical recovery milestones
- Pelvic floor exercise tracking
- C-section wound care reminders
- Bleeding tracking with alerts

#### Mood & Mental Health Tracking
- Daily mood logging (Edinburgh Postnatal Depression Scale)
- Symptom tracking for postpartum depression
- Anxiety tracking
- Journal entries with privacy controls
- Professional help resources
- Partner/family visibility controls
- Crisis hotline quick access

#### Physical Recovery
- Kegel exercise reminders and tracker
- Postpartum exercise programs
- Nutrition and hydration reminders
- Doctor appointment scheduling
- Pain level tracking

#### Support Resources
- Educational content library
- Lactation consultant directory
- Support group connections
- Emergency contacts quick access
- Telemedicine integration

## Non-Functional Requirements

### Performance
- API response time: <200ms (95th percentile)
- Mobile app launch: <2 seconds
- Video stream latency: <2 seconds
- Offline mode support with sync
- Handle 10,000+ concurrent users

### Security
- HTTPS/TLS 1.3 for all communications
- OAuth 2.0 + OpenID Connect authentication
- JWT with refresh tokens (15-min access, 30-day refresh)
- Role-based access control (RBAC) for family members
- Data encryption at rest (AES-256)
- Data encryption in transit
- GDPR/HIPAA compliance considerations
- Secure Bluetooth pairing (BLE Security Mode 1 Level 3)
- Rate limiting (AspNetCoreRateLimit)
  - 100 requests per minute per user
  - 1000 requests per hour per IP
- API key validation for mobile clients
- Certificate pinning in mobile app
- Secrets management via Azure Key Vault
- SQL injection prevention (parameterized queries)
- XSS protection headers
- CSRF tokens for web views
- Privacy-first design:
  - Minimal data collection
  - No third-party analytics
  - No advertising trackers
  - Local-first data storage
  - User data export on demand
  - Complete data deletion capability

### Reliability
- 99.9% uptime SLA
- Automatic failover
- Database backups (daily + point-in-time recovery)
- Graceful degradation
- Circuit breaker pattern for external services

### Scalability
- Horizontal scaling for API servers
- Database read replicas
- CDN for static assets
- Message queue for async operations
- Microservices-ready architecture

### Usability (Mother-Focused Design)
- **One-Handed Operation**: Primary design principle
  - All critical actions reachable by thumb
  - Large touch targets (minimum 44x44 points)
  - Bottom-anchored action buttons
  - Swipe gestures for common tasks
  - Voice commands for hands-free logging
- **Dark Mode**: Essential for night feedings
  - Automatic sunset/sunrise switching
  - Ultra-low brightness mode
  - Red-tinted night mode (less disruptive)
- **Quick Actions**: Minimize friction
  - One-tap logging for common activities
  - Home screen widgets
  - Quick action shortcuts
  - Apple Watch / WearOS support
- **Gentle Notifications**: Loving, not alarming
  - Soft notification sounds
  - Encouraging language ("Time for baby's feeding" not "Feeding overdue!")
  - Snooze options with intelligent intervals
  - Do Not Disturb integration
- **Offline Mode**: Full functionality without internet
  - All core features work offline
  - Background sync when connected
  - Conflict resolution for multi-user edits
- **Privacy First**: Mother's data is sacred
  - Local-first data storage
  - Optional cloud backup
  - Granular sharing controls
  - No ads, ever
  - Data export and deletion on demand
- **Accessibility**: WCAG 2.1 AA compliance
  - Screen reader optimized
  - Adjustable font sizes
  - High contrast mode
  - Voice control
- **Multi-language support**: i18n ready
- **Intuitive UI**: Following Fluent Design principles

### Maintainability
- Clean code principles
- Comprehensive unit tests (>80% coverage)
- Integration tests for critical paths
- API documentation (OpenAPI/Swagger)
- Code documentation (XML comments)
- Logging and monitoring
- Health check endpoints

## Mobile UI Architecture

### MVVM Implementation
```
Views (XAML)
    ↓
ViewModels (Commands, Properties, ObservableCollections)
    ↓
Services (Business Logic)
    ↓
Repositories (Data Access)
    ↓
API Client / Local Storage
```

### Key Screens

1. **Dashboard** (Optimized for Quick Glance)
   - Current status card (baby sleeping/awake/feeding)
   - Quick stats in large, easy-to-read fonts
   - Last feeding time with countdown to next
   - Last diaper change
   - Today's sleep total
   - One-tap quick action buttons (thumb-reachable)
   - Weight trend mini-chart
   - Monitor status indicator
   - Pattern insights: "Your baby usually feeds every 3 hours"

2. **Feeding Screen** (One-Handed Timer)
   - Large start/stop button
   - Active timer with breast side selector
   - Haptic feedback on timer start/stop
   - Quick log buttons for bottle feeding
   - History list with swipe to edit
   - Statistics view with trend charts
   - Reminder configuration
   - Pump session shortcut

3. **Sleep Tracker** (Essential New Screen)
   - Large "Sleep Started" / "Baby Woke" button
   - Current sleep duration timer
   - Sleep quality selector
   - Daily sleep summary
   - Night/day sleep breakdown
   - Sleep pattern insights
   - Age-appropriate sleep recommendations

4. **Diaper Log Screen** (Super Quick Entry)
   - Large icon buttons: 💧 💩 💧💩
   - One-tap logging with automatic timestamp
   - Daily count badge (with color coding)
   - Calendar view for history
   - Statistics dashboard
   - Comparison to medical standards

5. **Growth Tracker**
   - Weight entry form with unit toggle
   - Interactive growth chart (pinch to zoom)
   - Percentile visualization
   - Photo attachment with crop/rotate
   - Photo timeline gallery
   - Export for pediatrician (PDF)

6. **Medicine Tracker** (New Screen)
   - Active medications list
   - Dosage calculator based on current weight
   - "Give Dose" button with confirmation
   - Schedule visualization
   - Missed dose alerts
   - Medication library search

7. **Monitor Screen**
   - Full-screen video feed
   - Picture-in-picture support
   - Audio waveform visualization
   - Temperature display
   - Recording controls
   - White noise/lullaby player
   - Two-way audio button
   - Settings panel

8. **Mother's Corner** (Compassionate Support)
   - Daily mood check-in
   - Recovery checklist
   - Pump tracking
   - Exercise gentle reminders
   - Resources library
   - Appointment calendar
   - Partner activity feed
   - "How I'm feeling" journal

9. **Family Hub** (New Screen)
   - Activity feed showing all caregivers' actions
   - Family member list with permissions
   - Invite grandparents/nanny
   - Shared notes and observations
   - Shift schedule for partners

10. **Memories** (New Screen)
    - Photo gallery organized by month
    - Milestone timeline
    - First moments collection
    - Video clips
    - Export to photo book
    - Share with family (controlled)

### Navigation
- Bottom tab navigation (5 main tabs)
- Hamburger menu for settings/profile
- Modal sheets for quick actions
- Swipe gestures for common actions
- Pull-to-refresh on lists

## Development Phases

### Phase 1: MVP (8-10 weeks)
- User authentication and profiles
- Baby profile management
- Basic diaper tracking with one-tap logging
- Basic feeding tracking with timer and simple reminders
- **Sleep tracking** with start/stop timer
- Weight recording with basic charts
- Dark mode support
- Offline mode with local storage
- Mobile UI with core screens optimized for one-handed use

### Phase 2: Enhanced Features (6-8 weeks)
- Medicine tracking with dosage calculator
- Pump tracking and milk inventory
- Photo attachments and milestones
- Family sharing and multi-caregiver support
- Advanced analytics and reports
- WHO/CDC growth chart integration
- Smart reminder system with pattern detection
- Cloud sync with conflict resolution
- Export functionality (PDF for pediatrician)
- Mother recovery checklist
- Emergency contacts quick access

### Phase 3: Monitor Integration (6-8 weeks)
- Bluetooth device pairing
- Live video streaming
- Audio monitoring
- Recording and playback
- Multi-device support

### Phase 4: Advanced Features (4-6 weeks)
- Mother mental health tracking
- AI-powered insights and predictions
- Family sharing and collaboration
- Telemedicine integration
- Third-party integrations (smart scales, etc.)

### Phase 5: Polish & Launch (4 weeks)
- Performance optimization
- Security audit
- Accessibility improvements
- Beta testing
- App store submission
- Documentation and training materials

## Testing Strategy

### Unit Tests
- Domain logic
- Use case handlers
- Validators
- Utilities

### Integration Tests
- API endpoints
- Database operations
- External service integrations
- Authentication flow

### E2E Tests
- Critical user journeys
- Mobile UI workflows
- Cross-platform compatibility

### Performance Tests
- Load testing (API)
- Stress testing
- Video streaming performance
- Mobile app responsiveness

## Deployment Strategy

### Environments
- Development (local/Docker)
- Staging (Azure App Service)
- Production (Azure with auto-scaling)

### CI/CD Pipeline
1. Code commit triggers build
2. Run tests (unit, integration)
3. Code quality analysis (SonarQube)
4. Security scanning (OWASP)
5. Build Docker images
6. Deploy to staging
7. Run E2E tests
8. Manual approval gate
9. Deploy to production
10. Post-deployment verification

### Mobile App Release
- Automated builds via App Center
- Beta distribution (TestFlight, Google Play Internal Testing)
- Phased rollout (10% → 50% → 100%)
- Crash monitoring and analytics

## Success Metrics

### User Engagement
- Daily active users (DAU)
- Feature adoption rates
- Session duration
- Retention rate (D1, D7, D30)

### Health Outcomes
- Compliance with feeding schedules
- Diaper tracking consistency
- Weight tracking frequency
- Early issue detection rate

### Technical Metrics
- API response times
- Error rates
- App crash rate
- Video streaming quality

### Business Metrics
- User acquisition cost
- Customer satisfaction (NPS)
- App store ratings
- Premium feature conversion (future)

## Future Enhancements

### AI & Machine Learning
- Predictive feeding times based on patterns
- Cry detection and classification
- Sleep pattern optimization
- Health anomaly detection
- Personalized recommendations

### Social Features
- Parent community forums
- Milestone sharing
- Tip exchange
- Expert Q&A sessions

### Healthcare Integration
- Electronic health record (EHR) export
- Direct pediatrician portal access
- Vaccination scheduling
- Telehealth appointments
- Prescription reminders

### Smart Home Integration
- Voice assistant integration (Alexa, Google Home)
- Smart scale auto-sync
- Smart thermometer integration
- Automated journal entries

### Advanced Analytics
- Comparative analytics with anonymized data
- Research participation options
- Long-term developmental tracking
- Sibling comparisons

## Technical Debt Management

### Code Quality
- Regular refactoring sprints
- Dependency updates (quarterly)
- Performance profiling (monthly)
- Security patches (immediate)

### Documentation
- Keep API docs in sync
- Update architecture diagrams
- Maintain decision logs (ADRs)
- User documentation updates

## Conclusion

This specification provides a comprehensive blueprint for building a production-ready baby tracking application that showcases modern design patterns, clean architecture, and thoughtful API design. The phased approach allows for iterative development while maintaining focus on core value delivery. The emphasis on security, scalability, and usability ensures the application can grow with user needs while providing a solid foundation for technical interviews and real-world deployment.
