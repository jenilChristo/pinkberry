# Enhanced Prompt for Baby Chloe App Generation

## Project Overview
Generate a complete, production-ready baby tracking application called **Baby Chloe** that helps new parents monitor their baby's health, development, and daily activities while supporting maternal postpartum recovery.

## Primary Goals
1. **Interview Preparation**: Demonstrate mastery of enterprise design patterns, clean architecture, and RESTful API design
2. **Practical Utility**: Provide real value to new parents and mothers with loving, supportive UX
3. **Technical Excellence**: Showcase Microsoft engineering best practices with production-ready code

## Mother-First Design Philosophy (CRITICAL)
This app must be designed with deep empathy for exhausted, overwhelmed new parents:

### Core UX Principles
1. **One-Handed Operation**: All primary actions reachable by thumb (bottom-anchored buttons)
2. **Loving Language**: Always encouraging, never alarming
   - ✓ "Time for baby's feeding 💙" 
   - ✗ "FEEDING OVERDUE!"
3. **Gentle Notifications**: Soft sounds, gradual volume, loving messages
4. **Dark Mode Essential**: Ultra-low brightness for nighttime (3 AM feedings)
5. **Offline Always**: Full functionality without internet connection
6. **Privacy First**: Local storage by default, no ads, no tracking
7. **Quick Actions**: One-tap logging, voice commands, auto-completion
8. **Pattern Insights**: "Your baby typically feeds every 2.5 hours"
9. **Partner Visibility**: Show who did what for family coordination
10. **Emergency Access**: Pediatrician contact one tap away

## Technical Requirements

### Backend Stack
- **Framework**: ASP.NET Core 8+ Web API
- **Architecture**: Clean Architecture (Onion Architecture) with CQRS
- **Language**: C# 12+
- **Database**: PostgreSQL with Entity Framework Core
- **Caching**: Redis for real-time data
- **Real-time Communication**: SignalR for video streaming and live updates
- **Authentication**: OAuth 2.0 with JWT tokens
- **Documentation**: OpenAPI (Swagger)

### Frontend Stack
- **Framework**: .NET MAUI (Multi-platform App UI)
- **UI Library**: Microsoft Fluent UI for MAUI
- **Pattern**: MVVM with CommunityToolkit.Mvvm
- **Local Storage**: SQLite with offline-first approach
- **Navigation**: Shell navigation with flyout menu
- **State Management**: Reactive properties with observable collections
- **Voice Commands**: Speech recognition for hands-free logging
  - "Log diaper change wet"
  - "Start feeding left breast"
  - "Baby woke up"
- **Wearable Support**:
  - Apple Watch complications and complications
  - WearOS tiles for quick actions
  - Haptic feedback for reminders

### Design Patterns to Implement
#### Architectural
- Clean Architecture (Domain, Application, Infrastructure, Presentation)
- CQRS (Command Query Responsibility Segregation) with MediatR
- Repository Pattern with Unit of Work
- API Gateway pattern (future-ready for microservices)
- **Resilience Patterns** with Polly (retry, circuit breaker, timeout, bulkhead)
- **Background Services** with IHostedService (reminder processing, analytics)

#### Creational
- Factory Pattern for tracking record creation
- Builder Pattern for complex report generation
- Singleton Pattern for configuration and logging services
- Dependency Injection throughout all layers

#### Structural
- Adapter Pattern for Bluetooth device integration
- Facade Pattern for complex subsystem interfaces
- Decorator Pattern for logging and validation
- Proxy Pattern for lazy loading and caching

#### Behavioral
- Strategy Pattern for different reminder types
- Observer Pattern for event-driven notifications
- Chain of Responsibility for validation pipelines
- State Pattern for baby activity states
- Command Pattern via CQRS implementation

## Core Features to Generate

### 0. Sleep Tracking (CRITICAL - Previously Missing!)
**Why This Is Essential:** Sleep is the #1 concern for new parents. This feature is non-negotiable.

**User Stories:**
- As a parent, I want to log when baby falls asleep and wakes up with one tap
- As a parent, I want to see total daily/nightly sleep duration
- As a parent, I want to identify sleep patterns and optimal bedtimes
- As a parent, I want loving insights like "Baby sleeps best after 7:30 PM"
- As a parent, I want to track sleep quality (peaceful vs restless)

**Implementation Requirements:**
- Large "Sleep Started" / "Baby Woke" button (thumb-reachable)
- Active sleep timer showing duration
- Quick quality selector: Peaceful, Restless, Fussy, Crying
- Location options: Crib, Bassinet, Car Seat, Stroller, Parent Arms, Parent Bed
- Swaddled checkbox
- Daily summary: Total sleep, night/day breakdown, wake count
- **Sleep Insights:**
  - "Longest stretch: 4.5 hours 🌙"
  - "Total sleep: 14 hours (excellent for 2 months!)"
  - "Baby typically sleeps 2 hours after feeding"
- Age-based recommendations: Compare to medical standards
- Pattern detection: "Sleep improving - 30 min longer than last week ✨"

**API Endpoints:**
```
POST   /api/v1/babies/{babyId}/sleep              (Start/log sleep session)
GET    /api/v1/babies/{babyId}/sleep              (Get history)
GET    /api/v1/babies/{babyId}/sleep/active       (Current session if any)
PUT    /api/v1/babies/{babyId}/sleep/{id}/end     (End session)
GET    /api/v1/babies/{babyId}/sleep/statistics   (Daily/weekly stats)
GET    /api/v1/babies/{babyId}/sleep/patterns     (Pattern analysis)
GET    /api/v1/babies/{babyId}/sleep/insights     (Loving, encouraging insights)
```

### 1. Diaper Tracking System
**User Stories:**
- As a parent, I want to log diaper changes quickly with one tap
- As a parent, I want to see daily diaper count against medical standards
- As a parent, I want alerts if diaper changes are below recommended frequency

**Implementation Requirements:**
- Quick-log UI with large buttons (Wet/Soiled/Both/Dry)
- Daily summary view with visual indicators (green ≥8, yellow 5-7, red <5)
- Historical calendar view with color-coded days
- Statistics: daily/weekly/monthly averages
- Medical standards integration (WHO/AAP guidelines)
- Export capability for pediatrician visits

**API Endpoints:**
```
POST   /api/v1/babies/{babyId}/diapers
GET    /api/v1/babies/{babyId}/diapers?date={date}
GET    /api/v1/babies/{babyId}/diapers/statistics
GET    /api/v1/babies/{babyId}/diapers/compare-standards
```

### 2. Feeding Tracking with Smart Reminders
**User Stories:**
- As a parent, I want to track when and how long my baby feeds
- As a parent, I want automatic reminders for next feeding time
- As a parent, I want to see feeding patterns over time

**Implementation Requirements:**
- Active timer UI during feeding sessions
- Track type: breastfeeding (left/right/both), bottle, formula
- Record duration and amount
- Last feeding display on dashboard with countdown to next
- Smart reminder system:
  - Calculate interval based on recent feedings
  - Push notifications (local + remote via Azure Notification Hub)
  - Snooze and dismiss options
  - Night mode with gentle alerts
  - Adaptive ML-based predictions (future enhancement)

**API Endpoints:**
```
POST   /api/v1/babies/{babyId}/feedings
GET    /api/v1/babies/{babyId}/feedings/last
GET    /api/v1/babies/{babyId}/feedings/next-due
PUT    /api/v1/babies/{babyId}/feedings/reminders
GET    /api/v1/babies/{babyId}/feedings/statistics
```

### 3. Bluetooth Baby Monitor Integration
**User Stories:**
- As a parent, I want to view live video from my baby monitor in the app
- As a parent, I want audio alerts when my baby makes noise
- As a parent, I want to record video clips for later review

**Implementation Requirements:**
- Bluetooth Low Energy (BLE) device discovery and pairing
- Support for common baby monitor protocols
- SignalR WebSocket for low-latency video streaming
- Audio waveform visualization
- Motion detection alerts
- Two-way audio (talk-back feature)
- Local video recording with playback
- End-to-end encryption for security
- Background audio monitoring mode

**Technical Components:**
- BLE GATT client implementation (.NET MAUI)
- SignalR Hub for streaming (`/hubs/monitor`)
- H.264 video codec support
- Opus audio codec for low bandwidth
- Azure Blob Storage for cloud recordings (optional)

**API Endpoints:**
```
GET    /api/v1/babies/{babyId}/monitor/devices
POST   /api/v1/babies/{babyId}/monitor/devices/pair
WS     /hubs/monitor (SignalR WebSocket)
POST   /api/v1/babies/{babyId}/monitor/recordings
```

### 4. Weight & Growth Tracking
**User Stories:**
- As a parent, I want to record my baby's weight and see growth trends
- As a parent, I want to compare my baby's growth against medical standards
- As a parent, I want to see percentile curves and identify concerns early

**Implementation Requirements:**
- Weight entry form with date/time picker
- Support kg, lbs, grams with automatic conversion
- Length/height and head circumference tracking
- Photo attachment for visual progress
- Interactive growth charts:
  - WHO Child Growth Standards (0-5 years)
  - CDC Growth Charts (alternative)
  - Gender-specific curves
  - Percentile lines (3rd, 5th, 10th, 25th, 50th, 75th, 90th, 95th, 97th)
  - Plot baby's measurements on standard curves
  - Calculate and display percentile
  - Z-score calculation
- Alert if measurements deviate significantly
- Export charts as PDF or images

**API Endpoints:**
```
POST   /api/v1/babies/{babyId}/weight
GET    /api/v1/babies/{babyId}/weight/growth-chart
GET    /api/v1/babies/{babyId}/weight/percentile
GET    /api/v1/babies/{babyId}/weight/compare-standards?standard=WHO
```

### 5. Mother Recovery Support Features
**User Stories:**
- As a mother, I want to track my postpartum recovery progress
- As a mother, I want reminders for pelvic floor exercises
- As a mother, I want to monitor my mental health and mood

**Implementation Requirements:**
- Postpartum recovery checklist (customized by delivery type)
- Physical recovery tracking:
  - Pelvic floor (Kegel) exercise reminders
  - Wound care reminders (C-section specific)
  - Medication schedule
  - Doctor appointment reminders
- Mental health monitoring:
  - Daily mood logging (1-10 scale)
  - Edinburgh Postnatal Depression Scale (EPDS) questionnaire
  - Symptom tracking (anxiety, sadness, sleep issues)
  - Warning signs with professional help resources
- Educational content library
- Sleep tracking and tips
- Nutrition and hydration reminders

**API Endpoints:**
```
GET    /api/v1/mothers/profile
POST   /api/v1/mothers/mood-log
GET    /api/v1/mothers/recovery-checklist
PUT    /api/v1/mothers/recovery-checklist/{itemId}
POST   /api/v1/mothers/exercises/track
```

## Additional Required Features

### Dashboard
- Consolidated view of all key metrics
- Last feeding time with countdown
- Last diaper change
- Today's diaper count vs. standard
- Latest weight with trend arrow
- Quick action buttons for logging
- Monitor connection status

### Analytics & Reports
- Daily summary reports
- Weekly trend analysis
- Monthly overview with charts
- Exportable reports (PDF, CSV)
- Shareable with healthcare providers

### Multi-User Support
- Family account with multiple guardians
- Role-based permissions (primary caregiver, secondary, view-only)
- Activity feed showing who logged what
- Multiple baby profiles per family

### Offline Support
- Full offline functionality for logging activities
- Automatic sync when connection restored
- Conflict resolution (last-write-wins with timestamp)
- Visual sync status indicator

## Data Models to Generate

### Core Entities
```csharp
// Domain Models
public class Baby { Id, Name, BirthDate, Gender, BirthWeight, BirthLength, PhotoUrl, Guardians[] }
public class DiaperChange { Id, BabyId, Timestamp, Type, Notes, RecordedBy }
public class Feeding { Id, BabyId, StartTime, EndTime, Type, Amount, Side, Notes, RecordedBy }
public class WeightRecord { Id, BabyId, MeasuredAt, Weight, Length, HeadCircumference, Notes, RecordedBy }
public class Reminder { Id, BabyId, Type, NextDueTime, Interval, IsEnabled, Channels[] }
public class MotherProfile { Id, UserId, DeliveryDate, DeliveryType, MoodLogs[], RecoveryChecklist[], ExerciseHistory[] }
public class MonitorDevice { Id, BabyId, DeviceName, BluetoothId, IsPaired, LastConnected }
public class User { Id, Email, Name, Role, FamilyId, CreatedAt }
```

## API Design Requirements

### RESTful Principles
- Resource-based URLs (/babies, /diapers, /feedings)
- HTTP verbs (GET, POST, PUT, PATCH, DELETE)
- Status codes (200, 201, 204, 400, 401, 403, 404, 500)
- Pagination for collections: `?page=1&pageSize=20`
- Filtering: `?startDate=2026-01-01&endDate=2026-01-31`
- Sorting: `?sortBy=timestamp&sortOrder=desc`
- Field selection: `?fields=id,name,timestamp`

### API Versioning
- URL-based versioning: `/api/v1/`
- Accept header support (alternative)
- Deprecation warnings in response headers

### Response Format
```json
{
  "data": { /* resource or array */ },
  "meta": {
    "timestamp": "2026-05-28T10:30:00Z",
    "version": "1.0.0"
  },
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "totalItems": 95
  }
}
```

### Error Response Format
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Baby ID is required",
    "field": "babyId",
    "details": {}
  },
  "meta": {
    "timestamp": "2026-05-28T10:30:00Z",
    "requestId": "abc-123-def"
  }
}
```

## Security Requirements

### Authentication & Authorization
- OAuth 2.0 / OpenID Connect
- JWT access tokens (15-minute expiry)
- Refresh tokens (30-day expiry)
- Role-based access control (RBAC)
- Family-based data isolation
- Password requirements: min 8 chars, uppercase, lowercase, number, special char
- Two-factor authentication (optional enhancement)

### Data Protection
- TLS 1.3 for all API communications
- AES-256 encryption for data at rest
- Encrypted local storage on mobile
- Secure credential storage (iOS Keychain, Android Keystore)
- Video stream encryption
- PII handling compliance (GDPR considerations)

### API Security
- Rate limiting: 100 requests/minute per user
- Request throttling
- CORS configuration
- API key for server-to-server
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection

## Performance Requirements

### API Performance
- Response time: <200ms (95th percentile)
- Throughput: 1000 requests/second
- Database query optimization with indexes
- Redis caching for frequently accessed data
- Async/await throughout
- Background jobs for heavy processing

### Mobile Performance
- App launch: <2 seconds cold start
- Screen transitions: <100ms
- Image loading: progressive with placeholders
- List virtualization for large datasets
- Memory management: <100MB typical usage
- Battery optimization (background task management)

### Video Streaming
- Latency: <2 seconds
- Adaptive bitrate: 500kbps - 2Mbps
- Frame rate: 15-30 fps
- Resolution: 480p - 720p
- Buffer management for smooth playback

## Development Workflow

### Project Structure
```
BabyChloe/
├── src/
│   ├── BabyChloe.Domain/              # Domain entities, value objects, interfaces
│   ├── BabyChloe.Application/         # Use cases, CQRS handlers, DTOs
│   ├── BabyChloe.Infrastructure/      # Data access, external services
│   ├── BabyChloe.API/                 # ASP.NET Core Web API
│   └── BabyChloe.Mobile/              # .NET MAUI mobile app
├── tests/
│   ├── BabyChloe.Domain.Tests/
│   ├── BabyChloe.Application.Tests/
│   ├── BabyChloe.API.Tests/
│   └── BabyChloe.Mobile.Tests/
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
├── docker-compose.yml
├── .gitignore
├── README.md
└── SPECIFICATION.md
```

### Clean Architecture Layers

**Domain Layer** (innermost, no dependencies)
- Entities: Baby, DiaperChange, Feeding, etc.
- Value Objects: BabyAge, FeedingInterval, GrowthPercentile
- Domain Events: BabyFed, DiaperChanged, WeightRecorded
- Repository Interfaces
- Domain Services

**Application Layer** (depends on Domain)
- Commands: CreateBabyCommand, LogDiaperChangeCommand
- Queries: GetBabyByIdQuery, GetDailyDiaperSummaryQuery
- Handlers: CreateBabyCommandHandler, GetBabyByIdQueryHandler
- DTOs: BabyDto, DiaperChangeDto
- Validators: CreateBabyCommandValidator
- Mapping Profiles (AutoMapper)

**Infrastructure Layer** (depends on Application & Domain)
- DbContext and Migrations
- Repositories: BabyRepository, DiaperChangeRepository
- External Services: NotificationService, BlobStorageService
- SignalR Hubs: MonitorHub
- Authentication: JwtTokenService

**Presentation Layer** (depends on Application)
- API Controllers: BabiesController, DiapersController
- SignalR Hubs
- Middleware: ExceptionHandling, Logging
- Filters: ValidationFilter, AuthorizationFilter

### Development Phases

**Phase 1: Foundation (Week 1-2)**
- Project setup and structure
- Database schema design and migrations
- Authentication and authorization
- User and Baby profile management
- Basic API endpoints

**Phase 2: Core Tracking (Week 3-4)**
- Diaper tracking feature (complete)
- Feeding tracking feature (complete)
- Weight tracking feature (complete)
- Dashboard API and mobile UI
- Local data persistence (SQLite)

**Phase 3: Intelligence (Week 5-6)**
- Smart reminder system
- Analytics and statistics
- Medical standards integration
- Growth chart generation
- Report export functionality

**Phase 4: Monitor Integration (Week 7-9)**
- Bluetooth device pairing
- SignalR streaming setup
- Video streaming implementation
- Audio monitoring
- Recording functionality

**Phase 5: Mother Support (Week 10-11)**
- Mother profile and recovery tracking
- Mood logging and mental health features
- Exercise reminders
- Educational content integration

**Phase 6: Polish & Deploy (Week 12)**
- Performance optimization
- Security hardening
- Comprehensive testing
- Documentation
- Deployment to Azure
- App store preparation

## Testing Requirements

### Unit Tests (>80% coverage)
- Domain logic tests
- Command/Query handler tests
- Validator tests
- Service layer tests
- Use xUnit or NUnit

### Integration Tests
- API endpoint tests
- Database operations
- Authentication flow
- External service mocks
- Use WebApplicationFactory

### E2E Tests
- Critical user journeys
- Mobile UI tests (Appium or Xamarin.UITest)
- Cross-platform compatibility

### Performance Tests
- Load testing with JMeter or k6
- Stress testing
- Video streaming performance
- Mobile app profiling

## Deployment Requirements

### Containerization
```dockerfile
# API Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
# ... build steps
```

### Docker Compose (Development)
```yaml
services:
  api:
    build: ./BabyChloe.API
    ports: ["5000:80"]
  postgres:
    image: postgres:15
  redis:
    image: redis:7
```

### Azure Deployment
- Azure App Service for API
- Azure Database for PostgreSQL
- Azure Cache for Redis
- Azure Blob Storage for media
- Azure SignalR Service (scale out)
- Azure Notification Hub for push
- Application Insights for monitoring

### CI/CD Pipeline
- Build on every commit
- Run all tests
- Code quality checks (SonarQube)
- Security scanning
- Docker image build
- Deploy to staging automatically
- Manual approval for production
- Automated rollback on failure

## Documentation Requirements

### API Documentation
- OpenAPI (Swagger) specification
- Interactive documentation UI
- Request/response examples
- Authentication instructions
- Rate limiting details

### Code Documentation
- XML comments on public APIs
- Architecture Decision Records (ADRs)
- Design pattern explanations
- Setup and deployment guides

### User Documentation
- Feature guides
- Screenshots and videos
- FAQ section
- Privacy policy
- Terms of service

## Success Criteria

### Technical
- All design patterns implemented correctly
- Clean Architecture strictly enforced
- API follows REST best practices
- >80% test coverage
- <200ms API response time
- Zero security vulnerabilities (OWASP Top 10)

### Functional
- All 5 core features fully implemented
- Offline mode works seamlessly
- Video streaming <2 second latency
- Push notifications reliable
- Data sync without conflicts

### Interview Readiness
- Can explain any design pattern choice
- Can walk through architecture layers
- Can discuss scaling strategies
- Can demonstrate API design principles
- Can showcase code quality and testing

## Future Enhancements (Out of Scope for Initial Version)

- AI-powered cry detection and classification
- Sleep tracking and optimization
- Machine learning for feeding prediction
- Social features (community, sharing)
- Healthcare provider portal
- Telemedicine integration
- Smart device integrations (scales, thermometers)
- Voice assistant support (Alexa, Google)
- Multi-language support
- Premium features and monetization

## Generation Instructions for Spec Kit

When generating this application:

1. **Start with Domain Layer**: Create all entities and value objects first
2. **Build Application Layer**: Implement CQRS commands/queries with MediatR
3. **Add Infrastructure**: Set up DbContext, repositories, and external services
4. **Create API Layer**: Build controllers with proper routing and validation
5. **Develop Mobile UI**: Implement MVVM pattern with Fluent UI components
6. **Integrate Real-time**: Add SignalR for monitor streaming
7. **Implement Security**: Set up OAuth 2.0 and JWT authentication
8. **Add Testing**: Write comprehensive tests at all layers
9. **Document Everything**: Generate API docs, code comments, and user guides
10. **Deploy**: Containerize and deploy to Azure

### Code Generation Priorities
- Follow SOLID principles strictly
- Use dependency injection everywhere
- Implement proper error handling and logging
- Apply validation at all layers
- Use async/await for all I/O operations
- Include XML documentation comments
- Generate realistic seed data
- Create database migrations
- Set up health check endpoints
- Implement request/response logging

### Mobile App Priorities
- Responsive design (phone, tablet)
- Fluent Design System consistency
- Smooth animations and transitions
- Efficient memory management
- Battery optimization
- Offline-first approach
- Intuitive navigation
- Accessibility features
- Dark mode support
- One-handed operation

This enhanced prompt provides all the necessary details for a spec kit to generate a complete, production-ready baby tracking application that demonstrates advanced software engineering skills while delivering real value to users.
