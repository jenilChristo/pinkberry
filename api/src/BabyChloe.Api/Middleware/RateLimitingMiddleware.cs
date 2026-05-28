using System.Collections.Concurrent;
using System.Net;
using System.Security.Claims;

namespace BabyChloe.Api.Middleware;

public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ConcurrentDictionary<string, RateLimitEntry> _clients = new();
    private const int MaxRequestsPerMinute = 100;

    public RateLimitingMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        var clientId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? context.Connection.RemoteIpAddress?.ToString()
            ?? "anonymous";

        var entry = _clients.GetOrAdd(clientId, _ => new RateLimitEntry());

        lock (entry)
        {
            var now = DateTime.UtcNow;
            if (now - entry.WindowStart > TimeSpan.FromMinutes(1))
            {
                entry.WindowStart = now;
                entry.RequestCount = 0;
            }

            entry.RequestCount++;

            if (entry.RequestCount > MaxRequestsPerMinute)
            {
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.Headers["Retry-After"] = "60";
                return;
            }
        }

        await _next(context);
    }

    private class RateLimitEntry
    {
        public DateTime WindowStart { get; set; } = DateTime.UtcNow;
        public int RequestCount { get; set; }
    }
}
