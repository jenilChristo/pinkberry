# Baby Chloe - Architecture & Design Patterns Guide

## Overview
This document provides detailed implementation guidance for the architectural patterns and design patterns used in the Baby Chloe application. Each pattern includes the rationale, implementation strategy, and code examples.

## Table of Contents
1. [Clean Architecture Implementation](#clean-architecture-implementation)
2. [CQRS Pattern](#cqrs-pattern)
3. [Repository and Unit of Work Patterns](#repository-and-unit-of-work-patterns)
4. [Behavioral Patterns](#behavioral-patterns)
5. [Creational Patterns](#creational-patterns)
6. [Structural Patterns](#structural-patterns)
7. [MVVM Pattern (Mobile)](#mvvm-pattern-mobile)

---

## Clean Architecture Implementation

### Rationale
Clean Architecture (also known as Onion Architecture) ensures:
- Independence from frameworks and UI
- Testability without external dependencies
- Business logic centralization
- Technology flexibility
- Clear separation of concerns

### Layer Structure

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│    (API Controllers, Mobile Views)      │
├─────────────────────────────────────────┤
│        Application Layer                │
│  (Use Cases, Commands, Queries, DTOs)   │
├─────────────────────────────────────────┤
│         Domain Layer                    │
│   (Entities, Value Objects, Events)     │
└─────────────────────────────────────────┘
         Infrastructure Layer
    (Database, External Services)
```

### Implementation Details

#### Domain Layer (BabyChloe.Domain)

**Entities**
```csharp
namespace BabyChloe.Domain.Entities
{
    public class Baby : AggregateRoot
    {
        public Guid Id { get; private set; }
        public string Name { get; private set; }
        public DateTime BirthDate { get; private set; }
        public Gender Gender { get; private set; }
        public Weight BirthWeight { get; private set; } // Value Object
        public Length BirthLength { get; private set; } // Value Object
        private readonly List<DiaperChange> _diaperChanges = new();
        
        public IReadOnlyCollection<DiaperChange> DiaperChanges => _diaperChanges.AsReadOnly();
        
        // Factory method
        public static Baby Create(string name, DateTime birthDate, Gender gender, 
                                   Weight birthWeight, Length birthLength)
        {
            var baby = new Baby
            {
                Id = Guid.NewGuid(),
                Name = name,
                BirthDate = birthDate,
                Gender = gender,
                BirthWeight = birthWeight,
                BirthLength = birthLength
            };
            
            // Domain Event
            baby.AddDomainEvent(new BabyCreatedEvent(baby.Id, baby.Name));
            return baby;
        }
        
        // Business logic encapsulation
        public void RecordDiaperChange(DiaperType type, string notes, Guid recordedBy)
        {
            var change = DiaperChange.Create(this.Id, type, notes, recordedBy);
            _diaperChanges.Add(change);
            
            AddDomainEvent(new DiaperChangedEvent(this.Id, change.Id, type));
        }
        
        public DailyDiaperSummary GetDailyDiaperSummary(DateTime date)
        {
            var changesForDay = _diaperChanges
                .Where(dc => dc.Timestamp.Date == date.Date)
                .ToList();
                
            return DailyDiaperSummary.Create(date, changesForDay);
        }
    }
}
```

**Value Objects**
```csharp
namespace BabyChloe.Domain.ValueObjects
{
    public class Weight : ValueObject
    {
        public decimal Value { get; private set; }
        public WeightUnit Unit { get; private set; }
        
        private Weight() { } // For EF Core
        
        public static Weight FromKilograms(decimal kg)
        {
            if (kg < 0 || kg > 20) // Reasonable range for baby
                throw new DomainException("Invalid weight value");
                
            return new Weight { Value = kg, Unit = WeightUnit.Kilograms };
        }
        
        public Weight ConvertTo(WeightUnit targetUnit)
        {
            return targetUnit switch
            {
                WeightUnit.Pounds => new Weight 
                { 
                    Value = Value * 2.20462m, 
                    Unit = WeightUnit.Pounds 
                },
                WeightUnit.Grams => new Weight 
                { 
                    Value = Value * 1000, 
                    Unit = WeightUnit.Grams 
                },
                _ => this
            };
        }
        
        protected override IEnumerable<object> GetEqualityComponents()
        {
            yield return Value;
            yield return Unit;
        }
    }
    
    public enum WeightUnit { Kilograms, Pounds, Grams }
}
```

**Repository Interfaces** (in Domain, implemented in Infrastructure)
```csharp
namespace BabyChloe.Domain.Repositories
{
    public interface IBabyRepository
    {
        Task<Baby?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<List<Baby>> GetByFamilyIdAsync(Guid familyId, CancellationToken ct = default);
        Task<Baby> AddAsync(Baby baby, CancellationToken ct = default);
        Task UpdateAsync(Baby baby, CancellationToken ct = default);
        Task DeleteAsync(Guid id, CancellationToken ct = default);
    }
}
```

#### Application Layer (BabyChloe.Application)

**Commands (CQRS)**
```csharp
namespace BabyChloe.Application.Babies.Commands.CreateBaby
{
    public record CreateBabyCommand(
        string Name,
        DateTime BirthDate,
        string Gender,
        decimal BirthWeightKg,
        decimal BirthLengthCm,
        Guid FamilyId
    ) : IRequest<BabyDto>;
    
    public class CreateBabyCommandValidator : AbstractValidator<CreateBabyCommand>
    {
        public CreateBabyCommandValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .MaximumLength(100);
                
            RuleFor(x => x.BirthDate)
                .LessThanOrEqualTo(DateTime.UtcNow)
                .GreaterThan(DateTime.UtcNow.AddYears(-5));
                
            RuleFor(x => x.BirthWeightKg)
                .GreaterThan(0)
                .LessThanOrEqualTo(10);
        }
    }
    
    public class CreateBabyCommandHandler : IRequestHandler<CreateBabyCommand, BabyDto>
    {
        private readonly IBabyRepository _babyRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<CreateBabyCommandHandler> _logger;
        
        public CreateBabyCommandHandler(
            IBabyRepository babyRepository,
            IMapper mapper,
            ILogger<CreateBabyCommandHandler> logger)
        {
            _babyRepository = babyRepository;
            _mapper = mapper;
            _logger = logger;
        }
        
        public async Task<BabyDto> Handle(CreateBabyCommand request, CancellationToken ct)
        {
            var gender = Enum.Parse<Gender>(request.Gender);
            var weight = Weight.FromKilograms(request.BirthWeightKg);
            var length = Length.FromCentimeters(request.BirthLengthCm);
            
            var baby = Baby.Create(
                request.Name,
                request.BirthDate,
                gender,
                weight,
                length
            );
            
            await _babyRepository.AddAsync(baby, ct);
            
            _logger.LogInformation("Created baby {BabyId} with name {BabyName}", 
                baby.Id, baby.Name);
            
            return _mapper.Map<BabyDto>(baby);
        }
    }
}
```

**Queries (CQRS)**
```csharp
namespace BabyChloe.Application.Babies.Queries.GetBabyById
{
    public record GetBabyByIdQuery(Guid BabyId) : IRequest<BabyDto>;
    
    public class GetBabyByIdQueryHandler : IRequestHandler<GetBabyByIdQuery, BabyDto>
    {
        private readonly IBabyRepository _babyRepository;
        private readonly IMapper _mapper;
        
        public GetBabyByIdQueryHandler(IBabyRepository babyRepository, IMapper mapper)
        {
            _babyRepository = babyRepository;
            _mapper = mapper;
        }
        
        public async Task<BabyDto> Handle(GetBabyByIdQuery request, CancellationToken ct)
        {
            var baby = await _babyRepository.GetByIdAsync(request.BabyId, ct);
            
            if (baby == null)
                throw new NotFoundException(nameof(Baby), request.BabyId);
            
            return _mapper.Map<BabyDto>(baby);
        }
    }
}
```

#### Infrastructure Layer (BabyChloe.Infrastructure)

**Repository Implementation**
```csharp
namespace BabyChloe.Infrastructure.Persistence.Repositories
{
    public class BabyRepository : IBabyRepository
    {
        private readonly ApplicationDbContext _context;
        
        public BabyRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<Baby?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            return await _context.Babies
                .Include(b => b.DiaperChanges)
                .FirstOrDefaultAsync(b => b.Id == id, ct);
        }
        
        public async Task<Baby> AddAsync(Baby baby, CancellationToken ct = default)
        {
            await _context.Babies.AddAsync(baby, ct);
            await _context.SaveChangesAsync(ct);
            return baby;
        }
        
        public async Task UpdateAsync(Baby baby, CancellationToken ct = default)
        {
            _context.Babies.Update(baby);
            await _context.SaveChangesAsync(ct);
        }
    }
}
```

#### Presentation Layer (BabyChloe.API)

**Controllers**
```csharp
namespace BabyChloe.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class BabiesController : ControllerBase
    {
        private readonly IMediator _mediator;
        
        public BabiesController(IMediator mediator)
        {
            _mediator = mediator;
        }
        
        /// <summary>
        /// Creates a new baby profile
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(BabyDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<BabyDto>> CreateBaby(
            [FromBody] CreateBabyCommand command,
            CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return CreatedAtAction(nameof(GetBaby), new { id = result.Id }, result);
        }
        
        /// <summary>
        /// Gets a baby by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(BabyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BabyDto>> GetBaby(Guid id, CancellationToken ct)
        {
            var query = new GetBabyByIdQuery(id);
            var result = await _mediator.Send(query, ct);
            return Ok(result);
        }
    }
}
```

---

## CQRS Pattern

### Rationale
CQRS separates read and write operations, allowing:
- Optimized read models for queries
- Complex write models for business logic
- Independent scaling of reads vs writes
- Event sourcing compatibility
- Better performance through specialized models

### Implementation with MediatR

**Setup in Program.cs**
```csharp
builder.Services.AddMediatR(cfg => 
{
    cfg.RegisterServicesFromAssembly(typeof(CreateBabyCommand).Assembly);
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
});
```

**Validation Behavior (Pipeline)**
```csharp
public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;
    
    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }
    
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        if (_validators.Any())
        {
            var context = new ValidationContext<TRequest>(request);
            
            var validationResults = await Task.WhenAll(
                _validators.Select(v => v.ValidateAsync(context, ct)));
            
            var failures = validationResults
                .SelectMany(r => r.Errors)
                .Where(f => f != null)
                .ToList();
            
            if (failures.Any())
                throw new ValidationException(failures);
        }
        
        return await next();
    }
}
```

---

## Repository and Unit of Work Patterns

### Rationale
- Abstract data access logic
- Enable testing with mocks
- Centralize data access patterns
- Transaction management
- Reduce code duplication

### Repository Pattern Implementation

**Generic Repository**
```csharp
namespace BabyChloe.Infrastructure.Persistence
{
    public class Repository<T> : IRepository<T> where T : AggregateRoot
    {
        protected readonly ApplicationDbContext _context;
        protected readonly DbSet<T> _dbSet;
        
        public Repository(ApplicationDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }
        
        public virtual async Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            return await _dbSet.FindAsync(new object[] { id }, ct);
        }
        
        public virtual async Task<List<T>> GetAllAsync(CancellationToken ct = default)
        {
            return await _dbSet.ToListAsync(ct);
        }
        
        public virtual async Task<T> AddAsync(T entity, CancellationToken ct = default)
        {
            await _dbSet.AddAsync(entity, ct);
            return entity;
        }
        
        public virtual void Update(T entity)
        {
            _dbSet.Update(entity);
        }
        
        public virtual void Delete(T entity)
        {
            _dbSet.Remove(entity);
        }
    }
}
```

### Unit of Work Pattern

```csharp
namespace BabyChloe.Infrastructure.Persistence
{
    public interface IUnitOfWork : IDisposable
    {
        IBabyRepository Babies { get; }
        IDiaperChangeRepository DiaperChanges { get; }
        IFeedingRepository Feedings { get; }
        
        Task<int> SaveChangesAsync(CancellationToken ct = default);
        Task BeginTransactionAsync(CancellationToken ct = default);
        Task CommitTransactionAsync(CancellationToken ct = default);
        Task RollbackTransactionAsync();
    }
    
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private IDbContextTransaction? _transaction;
        
        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
            Babies = new BabyRepository(context);
            DiaperChanges = new DiaperChangeRepository(context);
            Feedings = new FeedingRepository(context);
        }
        
        public IBabyRepository Babies { get; }
        public IDiaperChangeRepository DiaperChanges { get; }
        public IFeedingRepository Feedings { get; }
        
        public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        {
            return await _context.SaveChangesAsync(ct);
        }
        
        public async Task BeginTransactionAsync(CancellationToken ct = default)
        {
            _transaction = await _context.Database.BeginTransactionAsync(ct);
        }
        
        public async Task CommitTransactionAsync(CancellationToken ct = default)
        {
            try
            {
                await _context.SaveChangesAsync(ct);
                await _transaction?.CommitAsync(ct)!;
            }
            catch
            {
                await RollbackTransactionAsync();
                throw;
            }
            finally
            {
                _transaction?.Dispose();
                _transaction = null;
            }
        }
        
        public async Task RollbackTransactionAsync()
        {
            await _transaction?.RollbackAsync()!;
            _transaction?.Dispose();
            _transaction = null;
        }
        
        public void Dispose()
        {
            _transaction?.Dispose();
            _context.Dispose();
        }
    }
}
```

---

## Behavioral Patterns

### Strategy Pattern - Reminder Strategies

**Problem**: Different types of reminders need different calculation logic
**Solution**: Strategy pattern for flexible reminder algorithms

```csharp
namespace BabyChloe.Application.Reminders.Strategies
{
    public interface IReminderStrategy
    {
        DateTime CalculateNextDueTime(DateTime lastEventTime, ReminderSettings settings);
    }
    
    // Fixed Interval Strategy
    public class FixedIntervalStrategy : IReminderStrategy
    {
        public DateTime CalculateNextDueTime(DateTime lastEventTime, ReminderSettings settings)
        {
            return lastEventTime.Add(settings.Interval);
        }
    }
    
    // Adaptive Strategy (ML-based in future)
    public class AdaptiveIntervalStrategy : IReminderStrategy
    {
        private readonly IFeedingPatternAnalyzer _analyzer;
        
        public AdaptiveIntervalStrategy(IFeedingPatternAnalyzer analyzer)
        {
            _analyzer = analyzer;
        }
        
        public DateTime CalculateNextDueTime(DateTime lastEventTime, ReminderSettings settings)
        {
            var predictedInterval = _analyzer.PredictNextInterval(settings.BabyId);
            return lastEventTime.Add(predictedInterval);
        }
    }
    
    // Time-of-Day Strategy
    public class TimeOfDayStrategy : IReminderStrategy
    {
        public DateTime CalculateNextDueTime(DateTime lastEventTime, ReminderSettings settings)
        {
            var nextTime = lastEventTime.Date.Add(settings.SpecificTimeOfDay);
            
            if (nextTime <= lastEventTime)
                nextTime = nextTime.AddDays(1);
                
            return nextTime;
        }
    }
    
    // Context that uses strategies
    public class ReminderService
    {
        private readonly Dictionary<ReminderType, IReminderStrategy> _strategies;
        
        public ReminderService(IServiceProvider serviceProvider)
        {
            _strategies = new Dictionary<ReminderType, IReminderStrategy>
            {
                { ReminderType.FixedInterval, serviceProvider.GetRequiredService<FixedIntervalStrategy>() },
                { ReminderType.Adaptive, serviceProvider.GetRequiredService<AdaptiveIntervalStrategy>() },
                { ReminderType.TimeOfDay, serviceProvider.GetRequiredService<TimeOfDayStrategy>() }
            };
        }
        
        public DateTime CalculateNextReminder(ReminderSettings settings, DateTime lastEventTime)
        {
            var strategy = _strategies[settings.Type];
            return strategy.CalculateNextDueTime(lastEventTime, settings);
        }
    }
}
```

### Observer Pattern - Domain Events

**Problem**: Decouple actions triggered by domain events
**Solution**: Observer pattern via domain events and handlers

```csharp
namespace BabyChloe.Domain.Events
{
    public abstract class DomainEvent
    {
        public DateTime OccurredOn { get; protected set; }
        
        protected DomainEvent()
        {
            OccurredOn = DateTime.UtcNow;
        }
    }
    
    public class BabyFedEvent : DomainEvent
    {
        public Guid BabyId { get; }
        public Guid FeedingId { get; }
        public FeedingType Type { get; }
        
        public BabyFedEvent(Guid babyId, Guid feedingId, FeedingType type)
        {
            BabyId = babyId;
            FeedingId = feedingId;
            Type = type;
        }
    }
}

namespace BabyChloe.Application.Events
{
    // Handler 1: Update reminder
    public class UpdateFeedingReminderHandler : INotificationHandler<BabyFedEvent>
    {
        private readonly IReminderService _reminderService;
        
        public UpdateFeedingReminderHandler(IReminderService reminderService)
        {
            _reminderService = reminderService;
        }
        
        public async Task Handle(BabyFedEvent notification, CancellationToken ct)
        {
            await _reminderService.RecalculateNextReminderAsync(
                notification.BabyId, 
                ReminderType.Feeding, 
                ct);
        }
    }
    
    // Handler 2: Send push notification
    public class SendFeedingNotificationHandler : INotificationHandler<BabyFedEvent>
    {
        private readonly INotificationService _notificationService;
        
        public SendFeedingNotificationHandler(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }
        
        public async Task Handle(BabyFedEvent notification, CancellationToken ct)
        {
            await _notificationService.SendToFamilyMembersAsync(
                notification.BabyId,
                $"Baby was fed at {notification.OccurredOn:HH:mm}",
                ct);
        }
    }
    
    // Handler 3: Update analytics
    public class UpdateFeedingAnalyticsHandler : INotificationHandler<BabyFedEvent>
    {
        private readonly IAnalyticsService _analyticsService;
        
        public UpdateFeedingAnalyticsHandler(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }
        
        public async Task Handle(BabyFedEvent notification, CancellationToken ct)
        {
            await _analyticsService.TrackFeedingEventAsync(notification, ct);
        }
    }
}
```

### Chain of Responsibility - Validation Pipeline

**Problem**: Multiple validation steps for weight records
**Solution**: Chain of Responsibility for extensible validation

```csharp
namespace BabyChloe.Application.Validation
{
    public abstract class ValidationHandler<T>
    {
        protected ValidationHandler<T>? _next;
        
        public ValidationHandler<T> SetNext(ValidationHandler<T> handler)
        {
            _next = handler;
            return handler;
        }
        
        public abstract Task<ValidationResult> ValidateAsync(T item, CancellationToken ct);
    }
    
    // Handler 1: Range validation
    public class WeightRangeValidator : ValidationHandler<WeightRecord>
    {
        public override async Task<ValidationResult> ValidateAsync(
            WeightRecord record, 
            CancellationToken ct)
        {
            if (record.Weight.Value < 0.5m || record.Weight.Value > 20m)
                return ValidationResult.Fail("Weight out of reasonable range");
            
            if (_next != null)
                return await _next.ValidateAsync(record, ct);
                
            return ValidationResult.Success();
        }
    }
    
    // Handler 2: Growth pattern validation
    public class GrowthPatternValidator : ValidationHandler<WeightRecord>
    {
        private readonly IWeightRepository _repository;
        
        public GrowthPatternValidator(IWeightRepository repository)
        {
            _repository = repository;
        }
        
        public override async Task<ValidationResult> ValidateAsync(
            WeightRecord record, 
            CancellationToken ct)
        {
            var previousRecords = await _repository.GetRecentRecordsAsync(
                record.BabyId, 
                count: 5, 
                ct);
            
            if (previousRecords.Any())
            {
                var lastWeight = previousRecords.OrderByDescending(r => r.MeasuredAt).First();
                var weightChange = Math.Abs(record.Weight.Value - lastWeight.Weight.Value);
                
                // Suspicious if weight changed more than 2kg since last measurement
                if (weightChange > 2m)
                    return ValidationResult.Warning("Unusual weight change detected");
            }
            
            if (_next != null)
                return await _next.ValidateAsync(record, ct);
                
            return ValidationResult.Success();
        }
    }
    
    // Handler 3: Medical standards validation
    public class MedicalStandardsValidator : ValidationHandler<WeightRecord>
    {
        private readonly IMedicalStandardsService _standards;
        
        public MedicalStandardsValidator(IMedicalStandardsService standards)
        {
            _standards = standards;
        }
        
        public override async Task<ValidationResult> ValidateAsync(
            WeightRecord record, 
            CancellationToken ct)
        {
            var percentile = await _standards.CalculatePercentileAsync(record, ct);
            
            if (percentile < 3 || percentile > 97)
                return ValidationResult.Warning("Weight outside normal percentile range");
            
            if (_next != null)
                return await _next.ValidateAsync(record, ct);
                
            return ValidationResult.Success();
        }
    }
    
    // Usage
    public class WeightRecordService
    {
        private readonly ValidationHandler<WeightRecord> _validationChain;
        
        public WeightRecordService(
            WeightRangeValidator rangeValidator,
            GrowthPatternValidator growthValidator,
            MedicalStandardsValidator standardsValidator)
        {
            // Build the chain
            _validationChain = rangeValidator;
            rangeValidator
                .SetNext(growthValidator)
                .SetNext(standardsValidator);
        }
        
        public async Task<ValidationResult> ValidateWeightRecordAsync(
            WeightRecord record, 
            CancellationToken ct)
        {
            return await _validationChain.ValidateAsync(record, ct);
        }
    }
}
```

---

## Creational Patterns

### Factory Pattern - Tracking Record Creation

**Problem**: Complex logic for creating different types of tracking records
**Solution**: Factory pattern for encapsulated creation logic

```csharp
namespace BabyChloe.Application.Factories
{
    public interface ITrackingRecordFactory
    {
        DiaperChange CreateDiaperChange(CreateDiaperChangeRequest request);
        Feeding CreateFeeding(CreateFeedingRequest request);
        WeightRecord CreateWeightRecord(CreateWeightRecordRequest request);
    }
    
    public class TrackingRecordFactory : ITrackingRecordFactory
    {
        private readonly ITimeProvider _timeProvider;
        private readonly ICurrentUserService _currentUser;
        
        public TrackingRecordFactory(ITimeProvider timeProvider, ICurrentUserService currentUser)
        {
            _timeProvider = timeProvider;
            _currentUser = currentUser;
        }
        
        public DiaperChange CreateDiaperChange(CreateDiaperChangeRequest request)
        {
            return new DiaperChange
            {
                Id = Guid.NewGuid(),
                BabyId = request.BabyId,
                Timestamp = request.Timestamp ?? _timeProvider.UtcNow,
                Type = request.Type,
                Notes = request.Notes,
                RecordedBy = _currentUser.UserId
            };
        }
        
        public Feeding CreateFeeding(CreateFeedingRequest request)
        {
            var feeding = new Feeding
            {
                Id = Guid.NewGuid(),
                BabyId = request.BabyId,
                StartTime = request.StartTime ?? _timeProvider.UtcNow,
                Type = request.Type,
                RecordedBy = _currentUser.UserId
            };
            
            // Type-specific initialization
            if (request.Type == FeedingType.Bottle || request.Type == FeedingType.Formula)
            {
                feeding.Amount = request.Amount;
            }
            else if (request.Type == FeedingType.Breastfeeding)
            {
                feeding.Side = request.Side;
            }
            
            return feeding;
        }
        
        public WeightRecord CreateWeightRecord(CreateWeightRecordRequest request)
        {
            return new WeightRecord
            {
                Id = Guid.NewGuid(),
                BabyId = request.BabyId,
                MeasuredAt = request.MeasuredAt ?? _timeProvider.UtcNow,
                Weight = Weight.FromKilograms(request.WeightKg),
                Length = request.LengthCm.HasValue 
                    ? Length.FromCentimeters(request.LengthCm.Value) 
                    : null,
                HeadCircumference = request.HeadCircumferenceCm.HasValue
                    ? Length.FromCentimeters(request.HeadCircumferenceCm.Value)
                    : null,
                Notes = request.Notes,
                RecordedBy = _currentUser.UserId
            };
        }
    }
}
```

### Builder Pattern - Report Generation

**Problem**: Complex report construction with many optional parameters
**Solution**: Builder pattern for fluent report creation

```csharp
namespace BabyChloe.Application.Reports
{
    public class BabyReportBuilder
    {
        private readonly Baby _baby;
        private DateTime _startDate;
        private DateTime _endDate;
        private bool _includeDiapers;
        private bool _includeFeedings;
        private bool _includeWeight;
        private bool _includeCharts;
        private ReportFormat _format;
        
        public BabyReportBuilder(Baby baby)
        {
            _baby = baby;
            _startDate = DateTime.UtcNow.AddDays(-7);
            _endDate = DateTime.UtcNow;
            _format = ReportFormat.Pdf;
        }
        
        public BabyReportBuilder ForDateRange(DateTime start, DateTime end)
        {
            _startDate = start;
            _endDate = end;
            return this;
        }
        
        public BabyReportBuilder IncludeDiaperTracking()
        {
            _includeDiapers = true;
            return this;
        }
        
        public BabyReportBuilder IncludeFeedingTracking()
        {
            _includeFeedings = true;
            return this;
        }
        
        public BabyReportBuilder IncludeWeightTracking()
        {
            _includeWeight = true;
            return this;
        }
        
        public BabyReportBuilder IncludeGrowthCharts()
        {
            _includeCharts = true;
            return this;
        }
        
        public BabyReportBuilder WithFormat(ReportFormat format)
        {
            _format = format;
            return this;
        }
        
        public async Task<BabyReport> BuildAsync(CancellationToken ct = default)
        {
            var report = new BabyReport
            {
                Baby = _baby,
                GeneratedAt = DateTime.UtcNow,
                StartDate = _startDate,
                EndDate = _endDate,
                Format = _format
            };
            
            if (_includeDiapers)
            {
                report.DiaperSummary = await BuildDiaperSummaryAsync(ct);
            }
            
            if (_includeFeedings)
            {
                report.FeedingSummary = await BuildFeedingSummaryAsync(ct);
            }
            
            if (_includeWeight)
            {
                report.WeightSummary = await BuildWeightSummaryAsync(ct);
            }
            
            if (_includeCharts)
            {
                report.GrowthChart = await BuildGrowthChartAsync(ct);
            }
            
            return report;
        }
        
        private async Task<DiaperSummary> BuildDiaperSummaryAsync(CancellationToken ct)
        {
            // Implementation
            await Task.CompletedTask;
            return new DiaperSummary();
        }
        
        // Other private build methods...
    }
    
    // Usage
    var report = await new BabyReportBuilder(baby)
        .ForDateRange(startDate, endDate)
        .IncludeDiaperTracking()
        .IncludeFeedingTracking()
        .IncludeGrowthCharts()
        .WithFormat(ReportFormat.Pdf)
        .BuildAsync();
}
```

---

## Structural Patterns

### Adapter Pattern - Bluetooth Device Integration

**Problem**: Different baby monitors have different APIs and protocols
**Solution**: Adapter pattern to provide uniform interface

```csharp
namespace BabyChloe.Infrastructure.Devices
{
    // Target interface
    public interface IBabyMonitorDevice
    {
        Task<bool> ConnectAsync(CancellationToken ct);
        Task DisconnectAsync(CancellationToken ct);
        Task<Stream> GetVideoStreamAsync(CancellationToken ct);
        Task<AudioData> GetAudioAsync(CancellationToken ct);
        Task<double> GetTemperatureAsync(CancellationToken ct);
        Task SendAudioAsync(byte[] audioData, CancellationToken ct);
    }
    
    // Adapter for Generic BLE Monitor
    public class GenericBleMonitorAdapter : IBabyMonitorDevice
    {
        private readonly IBluetoothLeDevice _bleDevice;
        private readonly Guid _videoCharacteristicId = new Guid("....");
        private readonly Guid _audioCharacteristicId = new Guid("....");
        
        public GenericBleMonitorAdapter(IBluetoothLeDevice bleDevice)
        {
            _bleDevice = bleDevice;
        }
        
        public async Task<bool> ConnectAsync(CancellationToken ct)
        {
            return await _bleDevice.ConnectAsync(ct);
        }
        
        public async Task DisconnectAsync(CancellationToken ct)
        {
            await _bleDevice.DisconnectAsync(ct);
        }
        
        public async Task<Stream> GetVideoStreamAsync(CancellationToken ct)
        {
            var characteristic = await _bleDevice.GetCharacteristicAsync(
                _videoCharacteristicId, 
                ct);
            
            return await characteristic.ReadStreamAsync(ct);
        }
        
        public async Task<AudioData> GetAudioAsync(CancellationToken ct)
        {
            var characteristic = await _bleDevice.GetCharacteristicAsync(
                _audioCharacteristicId, 
                ct);
            
            var bytes = await characteristic.ReadBytesAsync(ct);
            return AudioData.FromBytes(bytes);
        }
        
        public async Task<double> GetTemperatureAsync(CancellationToken ct)
        {
            // Implementation specific to this device
            await Task.CompletedTask;
            return 22.5;
        }
        
        public async Task SendAudioAsync(byte[] audioData, CancellationToken ct)
        {
            var characteristic = await _bleDevice.GetCharacteristicAsync(
                _audioCharacteristicId, 
                ct);
            
            await characteristic.WriteBytesAsync(audioData, ct);
        }
    }
    
    // Adapter for Proprietary Monitor Brand X
    public class BrandXMonitorAdapter : IBabyMonitorDevice
    {
        private readonly BrandXMonitorSdk _sdk;
        
        public BrandXMonitorAdapter(BrandXMonitorSdk sdk)
        {
            _sdk = sdk;
        }
        
        public async Task<bool> ConnectAsync(CancellationToken ct)
        {
            var result = await _sdk.Initialize();
            await _sdk.StartConnection();
            return result.Success;
        }
        
        public async Task<Stream> GetVideoStreamAsync(CancellationToken ct)
        {
            var videoSource = _sdk.GetVideoSource();
            return await videoSource.GetStreamAsync();
        }
        
        // Implement other methods adapting Brand X SDK to our interface
    }
    
    // Factory to create appropriate adapter
    public class MonitorAdapterFactory
    {
        public IBabyMonitorDevice CreateAdapter(string deviceType, object deviceSdk)
        {
            return deviceType switch
            {
                "GenericBLE" => new GenericBleMonitorAdapter((IBluetoothLeDevice)deviceSdk),
                "BrandX" => new BrandXMonitorAdapter((BrandXMonitorSdk)deviceSdk),
                _ => throw new NotSupportedException($"Device type {deviceType} not supported")
            };
        }
    }
}
```

### Facade Pattern - Complex Subsystem Simplification

**Problem**: Growth chart generation involves multiple complex services
**Solution**: Facade to provide simple interface

```csharp
namespace BabyChloe.Application.Facades
{
    public interface IGrowthChartFacade
    {
        Task<GrowthChartDto> GenerateGrowthChartAsync(
            Guid babyId, 
            GrowthChartOptions options, 
            CancellationToken ct);
    }
    
    public class GrowthChartFacade : IGrowthChartFacade
    {
        private readonly IWeightRepository _weightRepository;
        private readonly IBabyRepository _babyRepository;
        private readonly IMedicalStandardsService _standardsService;
        private readonly IChartGenerationService _chartService;
        private readonly IPercentileCalculator _percentileCalculator;
        
        public GrowthChartFacade(
            IWeightRepository weightRepository,
            IBabyRepository babyRepository,
            IMedicalStandardsService standardsService,
            IChartGenerationService chartService,
            IPercentileCalculator percentileCalculator)
        {
            _weightRepository = weightRepository;
            _babyRepository = babyRepository;
            _standardsService = standardsService;
            _chartService = chartService;
            _percentileCalculator = percentileCalculator;
        }
        
        public async Task<GrowthChartDto> GenerateGrowthChartAsync(
            Guid babyId, 
            GrowthChartOptions options, 
            CancellationToken ct)
        {
            // Step 1: Get baby info
            var baby = await _babyRepository.GetByIdAsync(babyId, ct);
            if (baby == null)
                throw new NotFoundException(nameof(Baby), babyId);
            
            // Step 2: Get weight records
            var weightRecords = await _weightRepository.GetByBabyIdAsync(babyId, ct);
            
            // Step 3: Get standard curves
            var standardCurves = await _standardsService.GetStandardCurvesAsync(
                baby.Gender,
                options.Standard, // WHO or CDC
                ct);
            
            // Step 4: Calculate percentiles for each weight
            var percentileData = weightRecords.Select(wr => new PercentilePoint
            {
                Date = wr.MeasuredAt,
                Weight = wr.Weight.Value,
                Percentile = _percentileCalculator.Calculate(
                    wr.Weight.Value,
                    baby.GetAgeAt(wr.MeasuredAt),
                    baby.Gender,
                    standardCurves)
            }).ToList();
            
            // Step 5: Generate chart image
            var chartImage = await _chartService.GenerateChartAsync(new ChartData
            {
                BabyData = percentileData,
                StandardCurves = standardCurves,
                Width = options.Width,
                Height = options.Height,
                Title = $"Growth Chart for {baby.Name}"
            }, ct);
            
            // Step 6: Build result DTO
            return new GrowthChartDto
            {
                BabyId = babyId,
                BabyName = baby.Name,
                GeneratedAt = DateTime.UtcNow,
                ChartImageUrl = chartImage.Url,
                DataPoints = percentileData,
                CurrentPercentile = percentileData.LastOrDefault()?.Percentile,
                Summary = GenerateSummary(baby, percentileData)
            };
        }
        
        private string GenerateSummary(Baby baby, List<PercentilePoint> data)
        {
            // Generate human-readable summary
            var current = data.LastOrDefault();
            if (current == null)
                return "No weight data available";
            
            return $"{baby.Name} is currently at the {current.Percentile}th percentile for weight.";
        }
    }
}
```

---

## Production-Ready Patterns (Microsoft Best Practices)

### Resilience Patterns with Polly

**Problem**: External dependencies (APIs, databases) can fail
**Solution**: Implement retry, circuit breaker, timeout, and fallback policies

```csharp
using Polly;
using Polly.Extensions.Http;

namespace BabyChloe.Infrastructure.Resilience
{
    public static class PollyPolicies
    {
        // Retry policy with exponential backoff
        public static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
        {
            return HttpPolicyExtensions
                .HandleTransientHttpError()
                .OrResult(msg => msg.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                .WaitAndRetryAsync(
                    retryCount: 3,
                    sleepDurationProvider: retryAttempt => 
                        TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                    onRetry: (outcome, timespan, retryAttempt, context) =>
                    {
                        Log.Warning(
                            "Retry {RetryAttempt} after {Delay}s due to {StatusCode}",
                            retryAttempt,
                            timespan.TotalSeconds,
                            outcome.Result?.StatusCode);
                    });
        }
        
        // Circuit breaker to prevent cascading failures
        public static IAsyncPolicy<HttpResponseMessage> GetCircuitBreakerPolicy()
        {
            return HttpPolicyExtensions
                .HandleTransientHttpError()
                .CircuitBreakerAsync(
                    handledEventsAllowedBeforeBreaking: 5,
                    durationOfBreak: TimeSpan.FromSeconds(30),
                    onBreak: (outcome, duration) =>
                    {
                        Log.Error(
                            "Circuit breaker opened for {Duration}s",
                            duration.TotalSeconds);
                    },
                    onReset: () =>
                    {
                        Log.Information("Circuit breaker reset");
                    },
                    onHalfOpen: () =>
                    {
                        Log.Information("Circuit breaker half-open - testing");
                    });
        }
        
        // Timeout policy to prevent hanging requests
        public static IAsyncPolicy<HttpResponseMessage> GetTimeoutPolicy()
        {
            return Policy
                .TimeoutAsync<HttpResponseMessage>(
                    timeout: TimeSpan.FromSeconds(10),
                    onTimeoutAsync: (context, timespan, task) =>
                    {
                        Log.Warning("Request timed out after {Timeout}s", timespan.TotalSeconds);
                        return Task.CompletedTask;
                    });
        }
        
        // Fallback policy for graceful degradation
        public static IAsyncPolicy<HttpResponseMessage> GetFallbackPolicy()
        {
            return Policy<HttpResponseMessage>
                .HandleResult(r => !r.IsSuccessStatusCode)
                .FallbackAsync(
                    fallbackValue: new HttpResponseMessage(System.Net.HttpStatusCode.OK)
                    {
                        Content = new StringContent("{\"cached\": true}")
                    },
                    onFallbackAsync: (outcome, context) =>
                    {
                        Log.Information("Fallback policy activated - returning cached data");
                        return Task.CompletedTask;
                    });
        }
        
        // Combined policy (wrap all together)
        public static IAsyncPolicy<HttpResponseMessage> GetCombinedPolicy()
        {
            return Policy.WrapAsync(
                GetFallbackPolicy(),
                GetCircuitBreakerPolicy(),
                GetRetryPolicy(),
                GetTimeoutPolicy()
            );
        }
    }
    
    // Usage in Startup
    public static class ResilienceServiceExtensions
    {
        public static IServiceCollection AddResilientHttpClients(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // Growth chart service with resilience
            services.AddHttpClient<IGrowthChartService, GrowthChartService>(client =>
            {
                client.BaseAddress = new Uri(configuration["GrowthChartApi:BaseUrl"]!);
                client.DefaultRequestHeaders.Add("Accept", "application/json");
            })
            .AddPolicyHandler(PollyPolicies.GetRetryPolicy())
            .AddPolicyHandler(PollyPolicies.GetCircuitBreakerPolicy())
            .AddPolicyHandler(PollyPolicies.GetTimeoutPolicy());
            
            // Notification service with resilience
            services.AddHttpClient<INotificationService, NotificationService>()
                .AddPolicyHandler(PollyPolicies.GetCombinedPolicy());
            
            return services;
        }
    }
}
```

### Health Checks Implementation

**Problem**: Need to monitor application health for orchestrators (Kubernetes)
**Solution**: Implement comprehensive health checks

```csharp
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace BabyChloe.API.HealthChecks
{
    // Custom health check for external dependencies
    public class BabyMonitorHealthCheck : IHealthCheck
    {
        private readonly IMonitorDeviceService _monitorService;
        
        public BabyMonitorHealthCheck(IMonitorDeviceService monitorService)
        {
            _monitorService = monitorService;
        }
        
        public async Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken ct = default)
        {
            try
            {
                var isConnected = await _monitorService.CheckConnectionAsync(ct);
                
                if (isConnected)
                {
                    return HealthCheckResult.Healthy("Baby monitor connection is healthy");
                }
                
                return HealthCheckResult.Degraded("Baby monitor disconnected");
            }
            catch (Exception ex)
            {
                return HealthCheckResult.Unhealthy(
                    "Baby monitor health check failed",
                    exception: ex);
            }
        }
    }
    
    // Startup configuration
    public static class HealthCheckExtensions
    {
        public static IServiceCollection AddBabyChloeHealthChecks(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddHealthChecks()
                // Database
                .AddNpgSql(
                    connectionString: configuration.GetConnectionString("DefaultConnection")!,
                    name: "postgresql",
                    failureStatus: HealthStatus.Unhealthy,
                    tags: new[] { "db", "ready" })
                    
                // Redis cache
                .AddRedis(
                    redisConnectionString: configuration.GetConnectionString("Redis")!,
                    name: "redis",
                    failureStatus: HealthStatus.Degraded,
                    tags: new[] { "cache", "ready" })
                    
                // SignalR hub
                .AddSignalRHub(
                    hubUrl: configuration["SignalR:HubUrl"]!,
                    name: "signalr",
                    failureStatus: HealthStatus.Degraded,
                    tags: new[] { "realtime" })
                    
                // Custom checks
                .AddCheck<BabyMonitorHealthCheck>(
                    name: "baby-monitor",
                    failureStatus: HealthStatus.Degraded,
                    tags: new[] { "external" })
                    
                // Azure Blob Storage
                .AddAzureBlobStorage(
                    connectionString: configuration["BlobStorage:ConnectionString"]!,
                    name: "blob-storage",
                    tags: new[] { "storage", "ready" });
            
            // Health checks UI (optional - for visualization)
            services.AddHealthChecksUI(setup =>
            {
                setup.SetEvaluationTimeInSeconds(60);
                setup.MaximumHistoryEntriesPerEndpoint(10);
                setup.AddHealthCheckEndpoint("Baby Chloe API", "/health");
            })
            .AddInMemoryStorage();
            
            return services;
        }
        
        public static IApplicationBuilder UseBabyChloeHealthChecks(
            this IApplicationBuilder app)
        {
            // Standard health endpoint
            app.UseHealthChecks("/health", new HealthCheckOptions
            {
                ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
                AllowCachingResponses = false
            });
            
            // Readiness probe (for K8s)
            app.UseHealthChecks("/health/ready", new HealthCheckOptions
            {
                Predicate = check => check.Tags.Contains("ready"),
                ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
            });
            
            // Liveness probe (for K8s)
            app.UseHealthChecks("/health/live", new HealthCheckOptions
            {
                Predicate = _ => false // Just checks if app is running
            });
            
            // Startup probe (for K8s)
            app.UseHealthChecks("/health/startup", new HealthCheckOptions
            {
                Predicate = check => check.Tags.Contains("startup")
            });
            
            // Health checks UI
            app.UseHealthChecksUI(options =>
            {
                options.UIPath = "/health-ui";
            });
            
            return app;
        }
    }
}
```

### Background Services for Scheduled Tasks

**Problem**: Need to process reminders and cleanup tasks periodically
**Solution**: IHostedService for background processing

```csharp
namespace BabyChloe.Infrastructure.BackgroundServices
{
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
            
            // Wait for app to fully start
            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessRemindersAsync(stoppingToken).ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing reminders");
                }
                
                await Task.Delay(_interval, stoppingToken).ConfigureAwait(false);
            }
            
            _logger.LogInformation("Reminder Processing Service stopped");
        }
        
        private async Task ProcessRemindersAsync(CancellationToken ct)
        {
            using var scope = _serviceProvider.CreateScope();
            var reminderService = scope.ServiceProvider
                .GetRequiredService<IReminderService>();
            
            var dueReminders = await reminderService
                .GetDueRemindersAsync(DateTime.UtcNow, ct)
                .ConfigureAwait(false);
            
            foreach (var reminder in dueReminders)
            {
                try
                {
                    await reminderService
                        .SendReminderNotificationAsync(reminder, ct)
                        .ConfigureAwait(false);
                    
                    _logger.LogInformation(
                        "Sent reminder {ReminderId} for baby {BabyId}",
                        reminder.Id,
                        reminder.BabyId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Failed to send reminder {ReminderId}",
                        reminder.Id);
                }
            }
        }
    }
    
    // Data cleanup service
    public class DataCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<DataCleanupService> _logger;
        private readonly TimeSpan _interval = TimeSpan.FromHours(24);
        
        public DataCleanupService(
            IServiceProvider serviceProvider,
            ILogger<DataCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }
        
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Data Cleanup Service started");
            
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CleanupOldDataAsync(stoppingToken).ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during data cleanup");
                }
                
                await Task.Delay(_interval, stoppingToken).ConfigureAwait(false);
            }
        }
        
        private async Task CleanupOldDataAsync(CancellationToken ct)
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            
            // Delete old notifications (> 30 days)
            var cutoffDate = DateTime.UtcNow.AddDays(-30);
            var oldNotifications = await context.Notifications
                .Where(n => n.CreatedAt < cutoffDate && n.IsRead)
                .ToListAsync(ct);
            
            context.Notifications.RemoveRange(oldNotifications);
            await context.SaveChangesAsync(ct);
            
            _logger.LogInformation(
                "Cleaned up {Count} old notifications",
                oldNotifications.Count);
        }
    }
    
    // Registration in Program.cs
    builder.Services.AddHostedService<ReminderProcessingService>();
    builder.Services.AddHostedService<DataCleanupService>();
}
```

### Async/Await Best Practices

**Critical for Performance and Scalability**

```csharp
namespace BabyChloe.Application.Examples
{
    public class AsyncBestPractices
    {
        // ✅ GOOD: Use ConfigureAwait(false) in library code
        public async Task<Baby?> GetBabyAsync(Guid id, CancellationToken ct = default)
        {
            var baby = await _repository
                .GetByIdAsync(id, ct)
                .ConfigureAwait(false);
                
            return baby;
        }
        
        // ✅ GOOD: Pass CancellationToken through
        public async Task<List<Baby>> GetBabiesAsync(
            int page,
            int pageSize,
            CancellationToken ct = default)
        {
            ct.ThrowIfCancellationRequested();
            
            return await _repository
                .GetPagedAsync(page, pageSize, ct)
                .ConfigureAwait(false);
        }
        
        // ✅ GOOD: Use Task.WhenAll for parallel operations
        public async Task<DashboardDto> GetDashboardAsync(
            Guid babyId,
            CancellationToken ct = default)
        {
            var tasks = new[]
            {
                _diaperRepository.GetTodayCountAsync(babyId, ct),
                _feedingRepository.GetLastAsync(babyId, ct),
                _sleepRepository.GetActiveSessionAsync(babyId, ct),
                _weightRepository.GetLatestAsync(babyId, ct)
            };
            
            await Task.WhenAll(tasks).ConfigureAwait(false);
            
            return new DashboardDto
            {
                DiaperCount = await tasks[0],
                LastFeeding = await tasks[1],
                ActiveSleep = await tasks[2],
                LatestWeight = await tasks[3]
            };
        }
        
        // ❌ BAD: Don't use async void (except event handlers)
        // public async void SaveBaby() { } // NO!
        
        // ✅ GOOD: Return Task instead
        public async Task SaveBabyAsync() 
        { 
            await _repository.SaveAsync();
        }
        
        // ❌ BAD: Don't use .Result or .Wait()
        // var baby = GetBabyAsync(id).Result; // Deadlock risk!
        
        // ✅ GOOD: Await all the way
        var baby = await GetBabyAsync(id, ct).ConfigureAwait(false);
    }
}
```

### Nullable Reference Types (C# 12)

**Eliminate NullReferenceExceptions**

```csharp
#nullable enable

namespace BabyChloe.Domain.Entities
{
    public class Baby
    {
        public Guid Id { get; init; }
        public string Name { get; set; } = string.Empty; // Non-nullable with default
        public string? Nickname { get; set; }             // Nullable - can be null
        public DateTime BirthDate { get; set; }
        public Gender Gender { get; set; }
        public List<string> Tags { get; set; } = new();   // Never null, empty list
    }
    
    // Repository interface with nullable annotations
    public interface IBabyRepository
    {
        // Returns null if not found
        Task<Baby?> GetByIdAsync(Guid id, CancellationToken ct = default);
        
        // Never returns null (throws NotFoundException instead)
        Task<Baby> GetByIdOrThrowAsync(Guid id, CancellationToken ct = default);
        
        // List is never null (can be empty)
        Task<List<Baby>> GetAllAsync(CancellationToken ct = default);
    }
}
```

---

## MVVM Pattern (Mobile)

### Implementation in .NET MAUI

**ViewModel Base**
```csharp
namespace BabyChloe.Mobile.ViewModels
{
    public abstract class ViewModelBase : ObservableObject
    {
        private bool _isBusy;
        private string _title = string.Empty;
        
        public bool IsBusy
        {
            get => _isBusy;
            set => SetProperty(ref _isBusy, value);
        }
        
        public string Title
        {
            get => _title;
            set => SetProperty(ref _title, value);
        }
        
        public virtual Task InitializeAsync() => Task.CompletedTask;
        public virtual Task OnAppearingAsync() => Task.CompletedTask;
        public virtual Task OnDisappearingAsync() => Task.CompletedTask;
    }
}
```

**Concrete ViewModel**
```csharp
namespace BabyChloe.Mobile.ViewModels
{
    public partial class DashboardViewModel : ViewModelBase
    {
        private readonly IBabyService _babyService;
        private readonly INavigationService _navigationService;
        
        [ObservableProperty]
        private BabyDto? _currentBaby;
        
        [ObservableProperty]
        private FeedingDto? _lastFeeding;
        
        [ObservableProperty]
        private string _nextFeedingTime = string.Empty;
        
        [ObservableProperty]
        private int _todayDiaperCount;
        
        [ObservableProperty]
        private ObservableCollection<ActivityDto> _recentActivities = new();
        
        public DashboardViewModel(IBabyService babyService, INavigationService navigationService)
        {
            _babyService = babyService;
            _navigationService = navigationService;
            Title = "Dashboard";
        }
        
        public override async Task InitializeAsync()
        {
            await LoadDashboardDataAsync();
        }
        
        [RelayCommand]
        private async Task LoadDashboardDataAsync()
        {
            if (IsBusy) return;
            
            try
            {
                IsBusy = true;
                
                CurrentBaby = await _babyService.GetCurrentBabyAsync();
                
                if (CurrentBaby != null)
                {
                    var tasks = new[]
                    {
                        LoadLastFeedingAsync(),
                        LoadTodayDiaperCountAsync(),
                        LoadRecentActivitiesAsync()
                    };
                    
                    await Task.WhenAll(tasks);
                }
            }
            catch (Exception ex)
            {
                await Shell.Current.DisplayAlert("Error", ex.Message, "OK");
            }
            finally
            {
                IsBusy = false;
            }
        }
        
        [RelayCommand]
        private async Task LogDiaperAsync()
        {
            await _navigationService.NavigateToAsync("diaper-log");
        }
        
        [RelayCommand]
        private async Task StartFeedingAsync()
        {
            await _navigationService.NavigateToAsync("feeding-timer");
        }
        
        private async Task LoadLastFeedingAsync()
        {
            LastFeeding = await _babyService.GetLastFeedingAsync(CurrentBaby!.Id);
            
            if (LastFeeding != null)
            {
                var interval = TimeSpan.FromHours(3); // Default interval
                var nextTime = LastFeeding.StartTime.Add(interval);
                var remaining = nextTime - DateTime.Now;
                
                NextFeedingTime = remaining.TotalMinutes > 0
                    ? $"Next feeding in {remaining.Hours}h {remaining.Minutes}m"
                    : "Feeding overdue";
            }
        }
        
        private async Task LoadTodayDiaperCountAsync()
        {
            TodayDiaperCount = await _babyService.GetTodayDiaperCountAsync(CurrentBaby!.Id);
        }
        
        private async Task LoadRecentActivitiesAsync()
        {
            var activities = await _babyService.GetRecentActivitiesAsync(CurrentBaby!.Id, 10);
            RecentActivities = new ObservableCollection<ActivityDto>(activities);
        }
    }
}
```

**View (XAML)**
```xml
<?xml version="1.0" encoding="utf-8" ?>
<ContentPage xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
             xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
             xmlns:vm="clr-namespace:BabyChloe.Mobile.ViewModels"
             x:Class="BabyChloe.Mobile.Views.DashboardPage"
             x:DataType="vm:DashboardViewModel"
             Title="{Binding Title}">
    
    <ScrollView>
        <VerticalStackLayout Padding="20" Spacing="15">
            
            <!-- Baby Info Card -->
            <Frame CornerRadius="10" HasShadow="True">
                <VerticalStackLayout Spacing="10">
                    <Label Text="{Binding CurrentBaby.Name}"
                           FontSize="24"
                           FontAttributes="Bold"/>
                    <Label Text="{Binding CurrentBaby.AgeText}"
                           FontSize="16"
                           TextColor="Gray"/>
                </VerticalStackLayout>
            </Frame>
            
            <!-- Quick Stats -->
            <Grid ColumnDefinitions="*,*" RowDefinitions="*,*" ColumnSpacing="10" RowSpacing="10">
                
                <!-- Last Feeding -->
                <Frame Grid.Row="0" Grid.Column="0">
                    <VerticalStackLayout>
                        <Label Text="Last Fed" FontAttributes="Bold"/>
                        <Label Text="{Binding LastFeeding.TimeAgo}"/>
                        <Label Text="{Binding NextFeedingTime}" TextColor="OrangeRed"/>
                    </VerticalStackLayout>
                </Frame>
                
                <!-- Diaper Count -->
                <Frame Grid.Row="0" Grid.Column="1">
                    <VerticalStackLayout>
                        <Label Text="Diapers Today" FontAttributes="Bold"/>
                        <Label Text="{Binding TodayDiaperCount}" FontSize="32"/>
                    </VerticalStackLayout>
                </Frame>
                
                <!-- Quick Actions -->
                <Button Grid.Row="1" Grid.Column="0"
                        Text="Log Diaper"
                        Command="{Binding LogDiaperCommand}"/>
                
                <Button Grid.Row="1" Grid.Column="1"
                        Text="Start Feeding"
                        Command="{Binding StartFeedingCommand}"/>
            </Grid>
            
            <!-- Recent Activity -->
            <Label Text="Recent Activity" FontSize="18" FontAttributes="Bold"/>
            
            <CollectionView ItemsSource="{Binding RecentActivities}">
                <CollectionView.ItemTemplate>
                    <DataTemplate>
                        <Frame Padding="10" Margin="0,5">
                            <Grid ColumnDefinitions="*,Auto">
                                <VerticalStackLayout Grid.Column="0">
                                    <Label Text="{Binding Description}"/>
                                    <Label Text="{Binding TimeAgo}" TextColor="Gray" FontSize="12"/>
                                </VerticalStackLayout>
                                <Label Grid.Column="1" Text="{Binding Icon}" FontSize="24"/>
                            </Grid>
                        </Frame>
                    </DataTemplate>
                </CollectionView.ItemTemplate>
            </CollectionView>
            
            <!-- Loading Indicator -->
            <ActivityIndicator IsRunning="{Binding IsBusy}" IsVisible="{Binding IsBusy}"/>
            
        </VerticalStackLayout>
    </ScrollView>
    
</ContentPage>
```

---

## Conclusion

This architecture and patterns guide provides comprehensive implementation details for building the Baby Chloe application with enterprise-grade design patterns. Each pattern serves a specific purpose and contributes to the overall maintainability, testability, and scalability of the application.

### Key Takeaways

1. **Clean Architecture** - Ensures separation of concerns and testability
2. **CQRS** - Optimizes read and write operations independently
3. **Repository & UoW** - Abstracts data access and manages transactions
4. **Behavioral Patterns** - Provides flexibility for runtime algorithm selection
5. **Creational Patterns** - Encapsulates complex object creation logic
6. **Structural Patterns** - Simplifies integration and provides uniform interfaces
7. **MVVM** - Separates presentation logic from UI for testability

These patterns work together to create a robust, maintainable, and interview-ready application that demonstrates mastery of software engineering principles.
