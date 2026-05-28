# Tasks: Baby Tracking Application

**Input**: Design documents from `/specs/001-baby-tracking-app/`

**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/api-v1.md ✓, quickstart.md ✓

**Tests**: Not explicitly requested in the specification. Test tasks are excluded.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, solution structure, and dependency installation

- [X] T001 Create solution and project structure per quickstart.md (dotnet new sln, api/, mobile/ projects)
- [X] T002 [P] Add NuGet packages to API projects (MediatR, EF Core, Npgsql, SignalR, FluentValidation, JWT)
- [X] T003 [P] Add NuGet packages to Mobile project (CommunityToolkit.Mvvm, sqlite-net-pcl, SignalR.Client, LiveChartsCore)
- [X] T004 [P] Add NuGet packages to test projects (xUnit, FluentAssertions, NSubstitute, Testcontainers)
- [X] T005 [P] Configure .editorconfig and Directory.Build.props for consistent formatting
- [X] T006 [P] Create Docker Compose file for PostgreSQL and Redis at docker-compose.yml

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Define domain enumerations in api/src/BabyChloe.Domain/Enums/ (Gender, CaregiverRole, SleepQuality, SleepLocation, FeedingType, BreastSide, DiaperType, SyncStatus)
- [X] T008 Create base entity abstract class with Id, CreatedAt, LastModifiedUtc, SyncStatus in api/src/BabyChloe.Domain/Entities/BaseEntity.cs
- [X] T009 Create Baby entity in api/src/BabyChloe.Domain/Entities/Baby.cs
- [X] T010 [P] Create Family entity in api/src/BabyChloe.Domain/Entities/Family.cs
- [X] T011 [P] Create Caregiver entity in api/src/BabyChloe.Domain/Entities/Caregiver.cs
- [X] T012 Create FamilyMembership entity in api/src/BabyChloe.Domain/Entities/FamilyMembership.cs
- [X] T013 Configure EF Core DbContext with all entity configurations in api/src/BabyChloe.Infrastructure/Persistence/BabyChloeDbContext.cs
- [X] T014 Create initial EF Core migration for all base entities in api/src/BabyChloe.Infrastructure/Persistence/Migrations/
- [X] T015 [P] Implement JWT authentication and authorization middleware in api/src/BabyChloe.Api/Middleware/AuthMiddleware.cs
- [X] T016 [P] Configure MediatR pipeline with validation behavior in api/src/BabyChloe.Application/Behaviors/ValidationBehavior.cs
- [X] T017 [P] Implement global error handling middleware in api/src/BabyChloe.Api/Middleware/ErrorHandlingMiddleware.cs
- [X] T018 [P] Configure dependency injection and service registration in api/src/BabyChloe.Api/Program.cs
- [X] T019 [P] Configure appsettings.Development.json with connection strings and JWT settings in api/src/BabyChloe.Api/appsettings.Development.json
- [X] T020 [P] Create base SQLite local database schema and service for mobile in mobile/src/BabyChloe.Mobile/Services/Storage/LocalDatabase.cs
- [X] T021 [P] Create local entity models mirroring domain entities for mobile in mobile/src/BabyChloe.Mobile/Models/
- [X] T022 Implement base API controller with common response patterns in api/src/BabyChloe.Api/Presentation/Controllers/BaseApiController.cs
- [X] T023 [P] Create auth endpoints (login, refresh) in api/src/BabyChloe.Api/Presentation/Controllers/AuthController.cs
- [X] T024 [P] Create family management endpoints (create, join) in api/src/BabyChloe.Api/Presentation/Controllers/FamiliesController.cs
- [X] T025 [P] Create baby CRUD endpoints in api/src/BabyChloe.Api/Presentation/Controllers/BabiesController.cs
- [X] T026 Implement MAUI app shell with bottom tab navigation (Dashboard, Activity, Growth, Settings) in mobile/src/BabyChloe.Mobile/AppShell.xaml

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 — One-Tap Sleep Logging (Priority: P1) 🎯 MVP

**Goal**: Parents can start/stop sleep sessions with a single tap and see duration with a loving summary

**Independent Test**: Start a sleep session, end it, verify duration calculation and insight message display correctly on dashboard

### Implementation for User Story 1

- [X] T027 [P] [US1] Create SleepRecord entity in api/src/BabyChloe.Domain/Entities/SleepRecord.cs
- [X] T028 [P] [US1] Create SleepRecord EF configuration and migration in api/src/BabyChloe.Infrastructure/Persistence/Configurations/SleepRecordConfiguration.cs
- [X] T029 [US1] Implement StartSleepCommand with MediatR handler in api/src/BabyChloe.Application/Commands/Sleep/StartSleepCommand.cs
- [X] T030 [US1] Implement EndSleepCommand with MediatR handler in api/src/BabyChloe.Application/Commands/Sleep/EndSleepCommand.cs
- [X] T031 [P] [US1] Implement GetActiveSleepQuery in api/src/BabyChloe.Application/Queries/Sleep/GetActiveSleepQuery.cs
- [X] T032 [P] [US1] Implement GetSleepStatisticsQuery with insight generation in api/src/BabyChloe.Application/Queries/Sleep/GetSleepStatisticsQuery.cs
- [X] T033 [US1] Create Sleep API controller with start, end, active, statistics endpoints in api/src/BabyChloe.Api/Presentation/Controllers/SleepController.cs
- [X] T034 [US1] Create SleepViewModel with timer logic and one-tap start/stop in mobile/src/BabyChloe.Mobile/ViewModels/Sleep/SleepViewModel.cs
- [X] T035 [US1] Create SleepPage XAML with large tap target button and timer display in mobile/src/BabyChloe.Mobile/Views/Sleep/SleepPage.xaml
- [X] T036 [US1] Implement local SleepRecord storage and retrieval in mobile/src/BabyChloe.Mobile/Services/Storage/SleepStorageService.cs
- [X] T037 [US1] Add sleep status card to DashboardViewModel showing active/last sleep in mobile/src/BabyChloe.Mobile/ViewModels/Dashboard/DashboardViewModel.cs
- [X] T038 [US1] Create DashboardPage with sleep summary card and quick-action sleep button in mobile/src/BabyChloe.Mobile/Views/Dashboard/DashboardPage.xaml

**Checkpoint**: Sleep logging is fully functional — one-tap start/stop with duration and insights

---

## Phase 4: User Story 2 — Feeding Timer with Smart Reminders (Priority: P1)

**Goal**: Parents can track feeding sessions with type/side, see pattern-based next-feeding countdown, and receive gentle reminders

**Independent Test**: Log a feeding session, verify "next feeding due" countdown appears based on average interval from last 7 feedings

### Implementation for User Story 2

- [X] T039 [P] [US2] Create Feeding entity in api/src/BabyChloe.Domain/Entities/Feeding.cs
- [X] T040 [P] [US2] Create FeedingReminder entity in api/src/BabyChloe.Domain/Entities/FeedingReminder.cs
- [X] T041 [P] [US2] Create Feeding EF configuration and migration in api/src/BabyChloe.Infrastructure/Persistence/Configurations/FeedingConfiguration.cs
- [X] T042 [US2] Implement StartFeedingCommand with type/side validation in api/src/BabyChloe.Application/Commands/Feeding/StartFeedingCommand.cs
- [X] T043 [US2] Implement EndFeedingCommand with duration calculation in api/src/BabyChloe.Application/Commands/Feeding/EndFeedingCommand.cs
- [X] T044 [US2] Implement GetNextFeedingDueQuery with weighted rolling average (last 7 feedings) in api/src/BabyChloe.Application/Queries/Feeding/GetNextFeedingDueQuery.cs
- [X] T045 [P] [US2] Implement GetFeedingStatisticsQuery in api/src/BabyChloe.Application/Queries/Feeding/GetFeedingStatisticsQuery.cs
- [X] T046 [US2] Create Feeding API controller with start, end, next-due, statistics endpoints in api/src/BabyChloe.Api/Presentation/Controllers/FeedingsController.cs
- [X] T047 [US2] Create FeedingViewModel with timer, type selector, and next-due countdown in mobile/src/BabyChloe.Mobile/ViewModels/Feeding/FeedingViewModel.cs
- [X] T048 [US2] Create FeedingPage XAML with breast side selector, timer, and amount input in mobile/src/BabyChloe.Mobile/Views/Feeding/FeedingPage.xaml
- [X] T049 [US2] Implement local Feeding storage with reminder calculation in mobile/src/BabyChloe.Mobile/Services/Storage/FeedingStorageService.cs
- [X] T050 [US2] Implement local notification service for feeding reminders in mobile/src/BabyChloe.Mobile/Services/Notifications/FeedingReminderService.cs
- [X] T051 [US2] Add feeding status card with next-due countdown to DashboardViewModel in mobile/src/BabyChloe.Mobile/ViewModels/Dashboard/DashboardViewModel.cs

**Checkpoint**: Feeding tracking is fully functional — timer, type/side, smart countdown, gentle reminders

---

## Phase 5: User Story 3 — Diaper Change Quick Log (Priority: P1)

**Goal**: Parents can log diaper changes with one tap and see daily count with health comparison

**Independent Test**: Log several diaper changes, verify daily count displays correctly with appropriate health status message

### Implementation for User Story 3

- [X] T052 [P] [US3] Create DiaperChange entity in api/src/BabyChloe.Domain/Entities/DiaperChange.cs
- [X] T053 [P] [US3] Create DiaperChange EF configuration and migration in api/src/BabyChloe.Infrastructure/Persistence/Configurations/DiaperChangeConfiguration.cs
- [X] T054 [US3] Implement LogDiaperChangeCommand with duplicate prevention (60s window) in api/src/BabyChloe.Application/Commands/Diaper/LogDiaperChangeCommand.cs
- [X] T055 [US3] Implement GetDiaperStatisticsQuery with health threshold logic (8+/5-7/<5) in api/src/BabyChloe.Application/Queries/Diaper/GetDiaperStatisticsQuery.cs
- [X] T056 [US3] Create Diaper API controller with log and statistics endpoints in api/src/BabyChloe.Api/Presentation/Controllers/DiapersController.cs
- [X] T057 [US3] Create DiaperViewModel with quick-log type selector in mobile/src/BabyChloe.Mobile/ViewModels/Diaper/DiaperViewModel.cs
- [X] T058 [US3] Create DiaperPage XAML with one-tap type buttons (Wet/Soiled/Both) in mobile/src/BabyChloe.Mobile/Views/Diaper/DiaperPage.xaml
- [X] T059 [US3] Implement local DiaperChange storage with daily statistics in mobile/src/BabyChloe.Mobile/Services/Storage/DiaperStorageService.cs
- [X] T060 [US3] Add diaper count card with health status to DashboardViewModel in mobile/src/BabyChloe.Mobile/ViewModels/Dashboard/DashboardViewModel.cs

**Checkpoint**: Diaper quick-log is fully functional — one-tap logging with health comparison

---

## Phase 6: User Story 6 — Dashboard at a Glance (Priority: P1)

**Goal**: Parent opens the app and immediately sees all key metrics (sleep, feeding, diapers) with quick-action buttons, no scrolling

**Independent Test**: Verify dashboard displays correct summary data from all activity types and quick-action buttons are accessible in the visible area

### Implementation for User Story 6

- [X] T061 [US6] Implement GetDashboardQuery aggregating sleep, feeding, diaper data in api/src/BabyChloe.Application/Queries/Dashboard/GetDashboardQuery.cs
- [X] T062 [US6] Create Dashboard API endpoint in api/src/BabyChloe.Api/Presentation/Controllers/DashboardController.cs
- [X] T063 [US6] Finalize DashboardPage layout with all metric cards and FAB quick-action panel in mobile/src/BabyChloe.Mobile/Views/Dashboard/DashboardPage.xaml
- [X] T064 [US6] Implement quick-action FAB expanding to Sleep/Feed/Diaper buttons in mobile/src/BabyChloe.Mobile/Views/Dashboard/QuickActionPanel.xaml
- [X] T065 [US6] Ensure all dashboard content fits without scrolling on standard phone sizes in mobile/src/BabyChloe.Mobile/Views/Dashboard/DashboardPage.xaml

**Checkpoint**: Dashboard delivers all key metrics at a glance with one-tap quick actions

---

## Phase 7: User Story 7 — Offline-First Experience (Priority: P1)

**Goal**: All logging works fully offline; data syncs automatically when connectivity returns

**Independent Test**: Disable network, perform all logging actions, re-enable network, verify data syncs correctly

### Implementation for User Story 7

- [X] T066 [US7] Implement connectivity monitoring service in mobile/src/BabyChloe.Mobile/Services/Sync/ConnectivityService.cs
- [X] T067 [US7] Implement sync queue tracking pending changes in mobile/src/BabyChloe.Mobile/Services/Sync/SyncQueue.cs
- [X] T068 [US7] Implement background sync service with delta-sync via LastModifiedUtc timestamps in mobile/src/BabyChloe.Mobile/Services/Sync/BackgroundSyncService.cs
- [X] T069 [US7] Implement sync push endpoint handler (POST /sync/push) in api/src/BabyChloe.Api/Presentation/Controllers/SyncController.cs
- [X] T070 [P] [US7] Implement sync pull endpoint handler (POST /sync/pull) in api/src/BabyChloe.Api/Presentation/Controllers/SyncController.cs
- [X] T071 [US7] Implement conflict resolution with last-writer-wins strategy in api/src/BabyChloe.Application/Commands/Sync/SyncPushCommand.cs
- [X] T072 [US7] Integrate sync service with all storage services (sleep, feeding, diaper) in mobile/src/BabyChloe.Mobile/Services/Sync/BackgroundSyncService.cs
- [X] T073 [US7] Add sync status indicator to app shell showing online/offline/syncing state in mobile/src/BabyChloe.Mobile/AppShell.xaml

**Checkpoint**: App is fully functional offline; background sync works seamlessly on reconnection

---

## Phase 8: User Story 4 — Growth & Weight Tracking (Priority: P2)

**Goal**: Parents log growth measurements and see WHO percentile placement with trend visualization

**Independent Test**: Enter weight measurements, verify percentile placement matches WHO standards and trend chart displays

### Implementation for User Story 4

- [X] T074 [P] [US4] Create GrowthMeasurement entity in api/src/BabyChloe.Domain/Entities/GrowthMeasurement.cs
- [X] T075 [P] [US4] Create GrowthMeasurement EF configuration and migration in api/src/BabyChloe.Infrastructure/Persistence/Configurations/GrowthMeasurementConfiguration.cs
- [X] T076 [P] [US4] Embed WHO LMS tables as static data resources in api/src/BabyChloe.Infrastructure/Services/WhoGrowthData/
- [X] T077 [US4] Implement WHO percentile calculation service (LMS/Box-Cox method) in api/src/BabyChloe.Infrastructure/Services/GrowthPercentileService.cs
- [X] T078 [US4] Implement LogGrowthMeasurementCommand in api/src/BabyChloe.Application/Commands/Growth/LogGrowthMeasurementCommand.cs
- [X] T079 [US4] Implement GetGrowthPercentilesQuery in api/src/BabyChloe.Application/Queries/Growth/GetGrowthPercentilesQuery.cs
- [X] T080 [P] [US4] Implement GetGrowthChartQuery returning data points with percentile bands in api/src/BabyChloe.Application/Queries/Growth/GetGrowthChartQuery.cs
- [X] T081 [US4] Create Growth API controller with log, percentiles, chart endpoints in api/src/BabyChloe.Api/Presentation/Controllers/GrowthController.cs
- [X] T082 [US4] Create GrowthViewModel with measurement entry and percentile display in mobile/src/BabyChloe.Mobile/ViewModels/Growth/GrowthViewModel.cs
- [X] T083 [US4] Create GrowthPage XAML with measurement input form in mobile/src/BabyChloe.Mobile/Views/Growth/GrowthPage.xaml
- [X] T084 [US4] Create GrowthChartPage with interactive trend line using LiveCharts2 in mobile/src/BabyChloe.Mobile/Views/Growth/GrowthChartPage.xaml
- [X] T085 [US4] Implement local GrowthMeasurement storage and WHO data cache in mobile/src/BabyChloe.Mobile/Services/Storage/GrowthStorageService.cs

**Checkpoint**: Growth tracking is fully functional — measurements, WHO percentiles, trend chart

---

## Phase 9: User Story 5 — Multi-Caregiver Coordination (Priority: P2)

**Goal**: Multiple caregivers see each other's logged activities in real-time via activity feed

**Independent Test**: Two users log activities for the same baby, verify both see each other's entries in the activity feed within seconds

### Implementation for User Story 5

- [X] T086 [P] [US5] Implement SignalR FamilyHub with group management in api/src/BabyChloe.Infrastructure/SignalR/FamilyHub.cs
- [X] T087 [P] [US5] Create domain events for activity logging (SleepStarted, FeedingEnded, DiaperLogged) in api/src/BabyChloe.Domain/Events/
- [X] T088 [US5] Implement domain event handlers that broadcast via SignalR in api/src/BabyChloe.Application/EventHandlers/ActivityBroadcastHandler.cs
- [X] T089 [US5] Implement GetActivityFeedQuery with caregiver attribution in api/src/BabyChloe.Application/Queries/Activity/GetActivityFeedQuery.cs
- [X] T090 [US5] Create Activity Feed API endpoint in api/src/BabyChloe.Api/Presentation/Controllers/ActivityController.cs
- [X] T091 [US5] Implement SignalR client connection service in mobile/src/BabyChloe.Mobile/Services/Sync/SignalRService.cs
- [X] T092 [US5] Create ActivityFeedViewModel with real-time updates in mobile/src/BabyChloe.Mobile/ViewModels/Activity/ActivityFeedViewModel.cs
- [X] T093 [US5] Create ActivityFeedPage XAML showing who-did-what-when in mobile/src/BabyChloe.Mobile/Views/Activity/ActivityFeedPage.xaml
- [X] T094 [US5] Integrate SignalR events with dashboard for real-time metric updates in mobile/src/BabyChloe.Mobile/ViewModels/Dashboard/DashboardViewModel.cs

**Checkpoint**: Multi-caregiver coordination works — shared activity feed with real-time updates

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: UI refinements, theming, and production readiness

- [X] T095 [P] Implement three-theme system (Light, Dark, Ultra Night) with amber tones in mobile/src/BabyChloe.Mobile/Resources/Styles/
- [X] T096 [P] Configure auto Ultra Night mode between 9 PM - 6 AM in mobile/src/BabyChloe.Mobile/Services/ThemeService.cs
- [X] T097 [P] Ensure all touch targets are minimum 48x48dp with 8dp spacing across all pages in mobile/src/BabyChloe.Mobile/Resources/Styles/
- [X] T098 [P] Add haptic feedback for all primary actions (confirmations without modals) in mobile/src/BabyChloe.Mobile/Services/HapticService.cs
- [X] T099 [P] Implement rate limiting middleware (100 req/min per user) in api/src/BabyChloe.Api/Middleware/RateLimitingMiddleware.cs
- [X] T100 [P] Add health check endpoints for PostgreSQL and Redis in api/src/BabyChloe.Api/Program.cs
- [X] T101 Implement loving/encouraging language service for all insights and messages in mobile/src/BabyChloe.Mobile/Services/InsightLanguageService.cs
- [X] T102 [P] Add Dockerfile for API deployment in api/Dockerfile
- [X] T103 Code cleanup, remove unused imports, verify all endpoints match API contract in api/src/BabyChloe.Api/
- [X] T104 Run quickstart.md validation — verify solution builds and all projects compile

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 Sleep (Phase 3)**: Depends on Foundational — no other story dependencies
- **US2 Feeding (Phase 4)**: Depends on Foundational — no other story dependencies
- **US3 Diaper (Phase 5)**: Depends on Foundational — no other story dependencies
- **US6 Dashboard (Phase 6)**: Depends on US1, US2, US3 (needs their data to aggregate)
- **US7 Offline-First (Phase 7)**: Depends on US1, US2, US3 (syncs their data)
- **US4 Growth (Phase 8)**: Depends on Foundational — no other story dependencies
- **US5 Multi-Caregiver (Phase 9)**: Depends on Foundational + at least one activity story (US1/US2/US3)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1 Sleep) ──┐
                                           → Phase 4 (US2 Feeding) ├─→ Phase 6 (US6 Dashboard)
                                           → Phase 5 (US3 Diaper) ─┘         │
                                           → Phase 8 (US4 Growth)             ↓
                                           → Phase 9 (US5 Caregiver) ──→ Phase 7 (US7 Offline)
                                                                              │
                                                                              ↓
                                                                     Phase 10 (Polish)
```

### Within Each User Story

- Models/Entities first → EF Configuration → Commands → Queries → Controllers → ViewModels → Views → Storage Services

### Parallel Opportunities

- **Phase 1**: T002, T003, T004, T005, T006 all in parallel
- **Phase 2**: T010+T011 in parallel; T015+T016+T017+T018+T019+T020+T021 in parallel
- **Phase 3-5**: US1, US2, US3 can all proceed in parallel after Phase 2
- **Phase 8-9**: US4 and US5 can proceed in parallel after Phase 2
- **Within stories**: All tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1 (Sleep)

```bash
# Launch entity + EF config in parallel:
Task: T027 "Create SleepRecord entity in api/src/BabyChloe.Domain/Entities/SleepRecord.cs"
Task: T028 "Create SleepRecord EF configuration in api/src/BabyChloe.Infrastructure/Persistence/Configurations/SleepRecordConfiguration.cs"

# After entities, launch queries in parallel:
Task: T031 "Implement GetActiveSleepQuery"
Task: T032 "Implement GetSleepStatisticsQuery"
```

---

## Parallel Example: User Stories 1, 2, 3 (After Foundation)

```bash
# Three developers can work simultaneously:
Developer A: Phase 3 (US1 Sleep) — T027 through T038
Developer B: Phase 4 (US2 Feeding) — T039 through T051
Developer C: Phase 5 (US3 Diaper) — T052 through T060
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Sleep Logging)
4. **STOP and VALIDATE**: Test sleep start/stop independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Sleep) + US2 (Feeding) + US3 (Diaper) → Core tracking MVP
3. Add US6 (Dashboard) → Unified at-a-glance view
4. Add US7 (Offline-First) → Production-ready reliability
5. Add US4 (Growth) + US5 (Caregiver) → Full feature set
6. Polish → Production release

### Suggested MVP Scope

**Minimum**: Phase 1 + Phase 2 + Phase 3 (Sleep only) = 38 tasks
**Recommended**: Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5 + Phase 6 = 65 tasks (all P1 activity tracking + dashboard)
