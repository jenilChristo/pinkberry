# Quickstart: Baby Chloe App

**Feature**: 001-baby-tracking-app | **Date**: 2026-05-28

## Prerequisites

- .NET 8 SDK
- Visual Studio 2022 17.8+ (with .NET MAUI workload) or VS Code with C# Dev Kit
- PostgreSQL 15+ (for API server)
- Redis 7+ (for real-time caching)
- Docker (optional, for containerized backend)
- Android SDK / Xcode (for mobile emulators)

## Project Setup

### 1. Create Solution Structure

```bash
# From repository root
dotnet new sln -n BabyChloe

# API Project (Clean Architecture)
dotnet new webapi -n BabyChloe.Api -o api/src/BabyChloe.Api
dotnet new classlib -n BabyChloe.Domain -o api/src/BabyChloe.Domain
dotnet new classlib -n BabyChloe.Application -o api/src/BabyChloe.Application
dotnet new classlib -n BabyChloe.Infrastructure -o api/src/BabyChloe.Infrastructure

# API Tests
dotnet new xunit -n BabyChloe.Api.UnitTests -o api/tests/BabyChloe.Api.UnitTests
dotnet new xunit -n BabyChloe.Api.IntegrationTests -o api/tests/BabyChloe.Api.IntegrationTests

# Mobile Project
dotnet new maui -n BabyChloe.Mobile -o mobile/src/BabyChloe.Mobile
dotnet new xunit -n BabyChloe.Mobile.UnitTests -o mobile/tests/BabyChloe.Mobile.UnitTests

# Add all to solution
dotnet sln add api/src/BabyChloe.Api
dotnet sln add api/src/BabyChloe.Domain
dotnet sln add api/src/BabyChloe.Application
dotnet sln add api/src/BabyChloe.Infrastructure
dotnet sln add api/tests/BabyChloe.Api.UnitTests
dotnet sln add api/tests/BabyChloe.Api.IntegrationTests
dotnet sln add mobile/src/BabyChloe.Mobile
dotnet sln add mobile/tests/BabyChloe.Mobile.UnitTests
```

### 2. Key NuGet Packages

**API**:
```bash
# Domain (no dependencies)

# Application
dotnet add api/src/BabyChloe.Application package MediatR
dotnet add api/src/BabyChloe.Application package FluentValidation

# Infrastructure
dotnet add api/src/BabyChloe.Infrastructure package Microsoft.EntityFrameworkCore
dotnet add api/src/BabyChloe.Infrastructure package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add api/src/BabyChloe.Infrastructure package Microsoft.Extensions.Caching.StackExchangeRedis
dotnet add api/src/BabyChloe.Infrastructure package Microsoft.AspNetCore.SignalR

# API Presentation
dotnet add api/src/BabyChloe.Api package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add api/src/BabyChloe.Api package Microsoft.Extensions.Diagnostics.HealthChecks
dotnet add api/src/BabyChloe.Api package Microsoft.Extensions.Http.Polly

# Tests
dotnet add api/tests/BabyChloe.Api.UnitTests package NSubstitute
dotnet add api/tests/BabyChloe.Api.UnitTests package FluentAssertions
dotnet add api/tests/BabyChloe.Api.IntegrationTests package Testcontainers.PostgreSql
dotnet add api/tests/BabyChloe.Api.IntegrationTests package Microsoft.AspNetCore.Mvc.Testing
```

**Mobile**:
```bash
dotnet add mobile/src/BabyChloe.Mobile package CommunityToolkit.Mvvm
dotnet add mobile/src/BabyChloe.Mobile package sqlite-net-pcl
dotnet add mobile/src/BabyChloe.Mobile package Microsoft.AspNetCore.SignalR.Client
dotnet add mobile/src/BabyChloe.Mobile package LiveChartsCore.SkiaSharpView.Maui
```

### 3. Run the API (Development)

```bash
# Start PostgreSQL and Redis (Docker)
docker run -d --name babychloe-db -p 5432:5432 -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=babychloe postgres:15
docker run -d --name babychloe-redis -p 6379:6379 redis:7

# Run migrations
cd api/src/BabyChloe.Api
dotnet ef database update

# Start API
dotnet run --project api/src/BabyChloe.Api
# API available at https://localhost:5001
```

### 4. Run the Mobile App

```bash
# Android emulator
dotnet build mobile/src/BabyChloe.Mobile -t:Run -f net8.0-android

# iOS simulator (macOS only)
dotnet build mobile/src/BabyChloe.Mobile -t:Run -f net8.0-ios
```

### 5. Run Tests

```bash
# All tests
dotnet test

# Unit tests only
dotnet test api/tests/BabyChloe.Api.UnitTests

# Integration tests (requires Docker for Testcontainers)
dotnet test api/tests/BabyChloe.Api.IntegrationTests
```

## Development Workflow

1. Domain entities and value objects first (no dependencies)
2. Application layer: Commands/Queries with MediatR handlers
3. Infrastructure: EF Core DbContext, repositories, SignalR hub
4. API: Controllers mapping to MediatR commands
5. Mobile: ViewModels with local SQLite, sync service

## Key Configuration (appsettings.Development.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=babychloe;Username=postgres;Password=dev",
    "Redis": "localhost:6379"
  },
  "Jwt": {
    "Secret": "dev-secret-key-minimum-32-characters-long",
    "Issuer": "BabyChloe",
    "Audience": "BabyChloe.Mobile",
    "ExpirationMinutes": 60
  }
}
```
