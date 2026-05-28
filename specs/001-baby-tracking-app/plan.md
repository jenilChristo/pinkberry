# Implementation Plan: Baby Tracking Application

**Branch**: `001-baby-tracking-app` | **Date**: 2026-05-28 | **Spec**: `specs/001-baby-tracking-app/spec.md`

**Input**: Feature specification from `/specs/001-baby-tracking-app/spec.md`

## Summary

A comprehensive baby tracking mobile application for new parents with sleep, feeding, diaper, and growth tracking plus multi-caregiver coordination. Built as a .NET MAUI cross-platform mobile app with an ASP.NET Core 8 Web API backend, using Clean Architecture with CQRS, PostgreSQL for persistence, SQLite for offline-first local storage, and SignalR for real-time caregiver sync.

## Technical Context

**Language/Version**: C# 12 / .NET 8

**Primary Dependencies**: ASP.NET Core 8 (Web API), .NET MAUI, MediatR (CQRS), Entity Framework Core 8, SignalR, CommunityToolkit.Mvvm, Polly (resilience), Microsoft Fluent UI for MAUI

**Storage**: PostgreSQL (server) + SQLite (offline-first local on device) + Redis (real-time cache)

**Testing**: xUnit, FluentAssertions, NSubstitute, Testcontainers (integration), MAUI UI testing

**Target Platform**: iOS 15+ / Android 10+ (via .NET MAUI), Linux/Docker (API server)

**Project Type**: Mobile app + Web API service

**Performance Goals**: Dashboard loads <2s, activity logging <3s from app open, API <200ms p95, real-time sync <5s between caregivers

**Constraints**: Full offline capability, one-handed thumb operation, dark mode <5 nits, no third-party tracking/ads, local-first data

**Scale/Scope**: Multi-baby (3+), multi-caregiver families, ~15 screens, offline-first with background sync

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution is currently a template (not yet configured with specific principles). No gates to enforce. Proceeding without violations.

**Post-Design Re-check**: ✅ PASS — No constitution constraints defined. Design proceeds freely.

## Project Structure

### Documentation (this feature)

```text
specs/001-baby-tracking-app/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
api/
├── src/
│   └── BabyChloe.Api/
│       ├── Domain/
│       │   ├── Entities/
│       │   ├── Enums/
│       │   ├── Events/
│       │   └── ValueObjects/
│       ├── Application/
│       │   ├── Commands/
│       │   ├── Queries/
│       │   ├── Interfaces/
│       │   └── DTOs/
│       ├── Infrastructure/
│       │   ├── Persistence/
│       │   ├── Services/
│       │   └── SignalR/
│       └── Presentation/
│           ├── Controllers/
│           ├── Hubs/
│           └── Middleware/
└── tests/
    ├── BabyChloe.Api.UnitTests/
    ├── BabyChloe.Api.IntegrationTests/
    └── BabyChloe.Api.ContractTests/

mobile/
├── src/
│   └── BabyChloe.Mobile/
│       ├── Models/
│       ├── ViewModels/
│       ├── Views/
│       │   ├── Dashboard/
│       │   ├── Sleep/
│       │   ├── Feeding/
│       │   ├── Diaper/
│       │   ├── Growth/
│       │   └── Settings/
│       ├── Services/
│       │   ├── Sync/
│       │   ├── Storage/
│       │   └── Notifications/
│       └── Resources/
└── tests/
    ├── BabyChloe.Mobile.UnitTests/
    └── BabyChloe.Mobile.UITests/
```

**Structure Decision**: Mobile + API pattern selected. The app requires a .NET MAUI mobile client for cross-platform iOS/Android with offline-first SQLite, plus an ASP.NET Core Web API for server-side persistence, multi-caregiver sync, and real-time communication via SignalR.

## Complexity Tracking

> No constitution violations to justify — constitution is not yet configured.
