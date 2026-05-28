using BabyChloe.Api.Middleware;
using BabyChloe.Application.Behaviors;
using BabyChloe.Infrastructure.Persistence;
using FluentValidation;
using HealthChecks.NpgSql;
using MediatR;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<BabyChloeDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Redis cache
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "BabyChloe:";
});

// MediatR + Validation pipeline
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(ValidationBehavior<,>).Assembly));
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
builder.Services.AddValidatorsFromAssembly(typeof(ValidationBehavior<,>).Assembly);

// Authentication
builder.Services.AddJwtAuthentication(builder.Configuration);

// Controllers
builder.Services.AddControllers();

// SignalR
builder.Services.AddSignalR();

// Health checks
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("DefaultConnection")!)
    .AddRedis(builder.Configuration.GetConnectionString("Redis")!);

var app = builder.Build();

// Middleware pipeline
app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
