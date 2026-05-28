# API Contract: Baby Chloe REST API v1

**Base URL**: `/api/v1`  
**Auth**: Bearer JWT (optional for local-only mode)  
**Content-Type**: `application/json`

## Authentication

### POST /auth/login
Request OAuth token exchange.

**Request Body**:
```json
{
  "provider": "microsoft|google|apple",
  "idToken": "string"
}
```

**Response 200**:
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 3600,
  "caregiver": { "id": "guid", "displayName": "string" }
}
```

### POST /auth/refresh
**Request Body**: `{ "refreshToken": "string" }`  
**Response 200**: `{ "accessToken": "string", "refreshToken": "string", "expiresIn": 3600 }`

---

## Babies

### POST /babies
Create a baby profile.

**Request Body**:
```json
{
  "name": "string",
  "birthDate": "2026-01-15",
  "gender": "Male|Female|Other",
  "birthWeightKg": 3.5,
  "birthLengthCm": 50.0,
  "familyId": "guid"
}
```

**Response 201**: Created baby object with `id`.

### GET /babies/{babyId}
**Response 200**: Full baby profile object.

### PUT /babies/{babyId}
Update baby profile. Partial update (only provided fields).

### GET /families/{familyId}/babies
List all babies in a family. **Response 200**: Array of baby objects.

---

## Sleep Tracking

### POST /babies/{babyId}/sleep
Start a sleep session.

**Request Body**:
```json
{
  "startTime": "2026-05-28T03:15:00Z",
  "quality": "Peaceful|Restless|Fussy|Crying",
  "location": "Crib|Bassinet|CarSeat|Stroller|ParentArms|ParentBed",
  "wasSwaddled": false,
  "notes": "string?"
}
```

**Response 201**: Created sleep record with `id`.

### PUT /babies/{babyId}/sleep/{id}/end
End an active sleep session.

**Request Body**:
```json
{
  "endTime": "2026-05-28T07:30:00Z",
  "quality": "Peaceful"
}
```

**Response 200**: Updated sleep record with duration.

### GET /babies/{babyId}/sleep/active
**Response 200**: Active sleep session or 204 No Content.

### GET /babies/{babyId}/sleep?date={date}&page={page}&pageSize={pageSize}
List sleep records. Filterable by date range.

**Response 200**:
```json
{
  "items": [...],
  "totalCount": 42,
  "page": 1,
  "pageSize": 20
}
```

### GET /babies/{babyId}/sleep/statistics?period=today|week|month
**Response 200**:
```json
{
  "totalSleepMinutes": 720,
  "averageDurationMinutes": 180,
  "longestStretchMinutes": 270,
  "sessionCount": 4,
  "period": "today",
  "insight": "Great stretch! 4.5 hours 🌙"
}
```

---

## Feeding

### POST /babies/{babyId}/feedings
Start a feeding session.

**Request Body**:
```json
{
  "startTime": "2026-05-28T06:00:00Z",
  "type": "Breastfeeding|Bottle|Formula",
  "side": "Left|Right|Both|null",
  "amountMl": null,
  "notes": "string?"
}
```

**Response 201**: Created feeding record.

### PUT /babies/{babyId}/feedings/{id}
End or update a feeding.

**Request Body**:
```json
{
  "endTime": "2026-05-28T06:25:00Z",
  "amountMl": 120
}
```

### GET /babies/{babyId}/feedings/next-due
**Response 200**:
```json
{
  "nextDueAt": "2026-05-28T09:00:00Z",
  "minutesRemaining": 45,
  "averageIntervalMinutes": 180,
  "basedOnLastN": 7
}
```

### GET /babies/{babyId}/feedings/statistics?period=today|week|month
**Response 200**:
```json
{
  "totalFeedings": 8,
  "averageDurationMinutes": 22,
  "averageAmountMl": 110,
  "averageIntervalMinutes": 175,
  "byType": { "Breastfeeding": 5, "Bottle": 3 }
}
```

---

## Diaper Changes

### POST /babies/{babyId}/diapers
Log a diaper change.

**Request Body**:
```json
{
  "timestamp": "2026-05-28T08:30:00Z",
  "type": "Wet|Soiled|Both|Dry",
  "notes": "string?"
}
```

**Response 201**: Created diaper change record.

### GET /babies/{babyId}/diapers?date={date}
List diaper changes for a date.

### GET /babies/{babyId}/diapers/statistics
**Response 200**:
```json
{
  "todayCount": 8,
  "todayByType": { "Wet": 5, "Soiled": 2, "Both": 1 },
  "healthStatus": "Healthy|Advisory|Concern",
  "message": "Great hydration today! 💧",
  "weeklyAverage": 9.2
}
```

---

## Growth & Weight

### POST /babies/{babyId}/growth
Log a growth measurement.

**Request Body**:
```json
{
  "measuredAt": "2026-05-28",
  "weightKg": 5.2,
  "lengthCm": 58.0,
  "headCircumferenceCm": 39.5,
  "notes": "Pediatrician visit"
}
```

**Response 201**: Created measurement with calculated percentiles.

### GET /babies/{babyId}/growth/percentiles
**Response 200**:
```json
{
  "latestMeasurement": { "weightKg": 5.2, "lengthCm": 58.0, "headCm": 39.5 },
  "percentiles": {
    "weight": 65,
    "length": 72,
    "headCircumference": 55
  },
  "ageWeeks": 12,
  "standard": "WHO"
}
```

### GET /babies/{babyId}/growth/chart?metric=weight|length|head
**Response 200**: Array of data points with percentile bands for chart rendering.

---

## Dashboard

### GET /babies/{babyId}/dashboard
**Response 200**:
```json
{
  "baby": { "id": "guid", "name": "Chloe", "ageWeeks": 12 },
  "sleep": {
    "status": "active|inactive",
    "currentSession": null,
    "lastSleepEndedAt": "2026-05-28T06:00:00Z",
    "totalTodayMinutes": 480
  },
  "feeding": {
    "lastFeedingAt": "2026-05-28T06:00:00Z",
    "nextDueAt": "2026-05-28T09:00:00Z",
    "minutesUntilDue": 45
  },
  "diapers": {
    "todayCount": 6,
    "healthStatus": "Advisory",
    "message": "6 changes today — keep going! 💪"
  },
  "lastActivity": {
    "type": "Feeding",
    "caregiver": "Mom",
    "timestamp": "2026-05-28T06:25:00Z"
  }
}
```

---

## Family & Caregivers

### POST /families
Create a family. **Response 201**: Family with generated invite code.

### POST /families/{familyId}/join
Join a family via invite code.
**Request Body**: `{ "inviteCode": "ABC12345" }`

### GET /families/{familyId}/activity?page={page}&pageSize={pageSize}
Activity feed for the family.

**Response 200**:
```json
{
  "items": [
    {
      "id": "guid",
      "type": "Sleep|Feeding|Diaper|Growth",
      "action": "started|ended|logged",
      "babyName": "Chloe",
      "caregiverName": "Grandma",
      "summary": "Logged a wet diaper",
      "timestamp": "2026-05-28T08:30:00Z"
    }
  ]
}
```

---

## Sync

### POST /sync/push
Push local changes to server.

**Request Body**:
```json
{
  "lastSyncAt": "2026-05-28T06:00:00Z",
  "changes": [
    {
      "entityType": "SleepRecord|Feeding|DiaperChange|GrowthMeasurement",
      "entityId": "guid",
      "action": "create|update|delete",
      "data": { ... },
      "clientTimestamp": "2026-05-28T08:30:00Z"
    }
  ]
}
```

**Response 200**:
```json
{
  "accepted": ["guid1", "guid2"],
  "conflicts": [
    { "entityId": "guid3", "serverVersion": { ... }, "resolution": "server_wins" }
  ],
  "serverTimestamp": "2026-05-28T08:30:01Z"
}
```

### POST /sync/pull
Pull server changes since last sync.

**Request Body**: `{ "since": "2026-05-28T06:00:00Z" }`

**Response 200**:
```json
{
  "changes": [ ... ],
  "serverTimestamp": "2026-05-28T08:30:01Z",
  "hasMore": false
}
```

---

## SignalR Hub Contract

### Hub: /hubs/family

**Client → Server methods**:
- `JoinFamily(familyId: string)` — Join the family group for real-time updates
- `LeaveFamily(familyId: string)` — Leave the family group

**Server → Client events**:
- `ActivityLogged(activity: ActivityEvent)` — New activity from any caregiver
- `TimerStarted(type: string, babyId: string, caregiverName: string)` — Sleep/feeding timer started
- `TimerEnded(type: string, babyId: string, caregiverName: string, summary: string)` — Timer ended
- `CaregiverOnline(caregiverId: string, name: string)` — Caregiver connected
- `CaregiverOffline(caregiverId: string, name: string)` — Caregiver disconnected

---

## Common Response Patterns

### Error Response
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Validation Error",
  "status": 400,
  "errors": {
    "field": ["Error message"]
  }
}
```

### Pagination
All list endpoints support: `?page=1&pageSize=20`  
Response includes: `totalCount`, `page`, `pageSize`, `hasNextPage`

### Rate Limiting
- 100 requests/minute per authenticated user
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
