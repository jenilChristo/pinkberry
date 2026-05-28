# Data Model: Baby Tracking Application

**Feature**: 001-baby-tracking-app | **Date**: 2026-05-28

## Entities

### Baby

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| Id | Guid | PK | Unique identifier |
| Name | string | Required, max 100 | Baby's display name |
| BirthDate | DateTime | Required | Date of birth |
| Gender | enum | Male/Female/Other | Baby's gender |
| BirthWeightKg | decimal | >= 0 | Birth weight in kilograms |
| BirthLengthCm | decimal | >= 0 | Birth length in centimeters |
| PhotoUrl | string? | Optional | Profile photo URI |
| FamilyId | Guid | FK → Family | Family this baby belongs to |
| CreatedAt | DateTime | Auto | Record creation timestamp |
| LastModifiedUtc | DateTime | Auto | Last modification (for sync) |
| SyncStatus | enum | Pending/Synced/Conflict | Offline sync state |

**Relationships**: Belongs to one Family. Has many SleepRecords, Feedings, DiaperChanges, GrowthMeasurements.

---

### Family

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| Id | Guid | PK | Unique identifier |
| Name | string | Required, max 100 | Family display name |
| InviteCode | string | Unique, 8 chars | Code for joining family |
| CreatedAt | DateTime | Auto | Record creation timestamp |
| LastModifiedUtc | DateTime | Auto | Last modification (for sync) |

**Relationships**: Has many Babies, has many Caregivers (via FamilyMembership).

---

### Caregiver

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| Id | Guid | PK | Unique identifier |
| DisplayName | string | Required, max 100 | Caregiver's display name |
| Email | string? | Optional, unique | Email for account |
| AvatarUrl | string? | Optional | Profile photo URI |
| AuthProvider | string? | Optional | OAuth provider (Microsoft/Google/Apple) |
| AuthProviderId | string? | Optional | External auth ID |
| CreatedAt | DateTime | Auto | Record creation timestamp |
| LastModifiedUtc | DateTime | Auto | Last modification (for sync) |

**Relationships**: Belongs to many Families (via FamilyMembership).

---

### FamilyMembership

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| FamilyId | Guid | PK, FK → Family | Family reference |
| CaregiverId | Guid | PK, FK → Caregiver | Caregiver reference |
| Role | enum | Primary/Secondary/ViewOnly | Permission level |
| JoinedAt | DateTime | Auto | When caregiver joined family |

**Relationships**: Junction table between Family and Caregiver.

---

### SleepRecord

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| Id | Guid | PK | Unique identifier |
| BabyId | Guid | FK → Baby | Baby this record belongs to |
| StartTime | DateTime | Required | When sleep started |
| EndTime | DateTime? | Nullable | When sleep ended (null = active) |
| Quality | enum | Peaceful/Restless/Fussy/Crying | Sleep quality assessment |
| Location | enum | Crib/Bassinet/CarSeat/Stroller/ParentArms/ParentBed | Where baby slept |
| WasSwaddled | bool | Default false | Whether baby was swaddled |
| Notes | string? | Optional, max 500 | Free-text notes |
| RecordedBy | Guid | FK → Caregiver | Who logged this |
| CreatedAt | DateTime | Auto | Record creation timestamp |
| LastModifiedUtc | DateTime | Auto | Last modification (for sync) |
| SyncStatus | enum | Pending/Synced/Conflict | Offline sync state |

**Validation rules**:
- EndTime must be after StartTime (when set)
- Sleep sessions cannot overlap for the same baby
- Duration calculated as EndTime - StartTime

**State transitions**: Active (EndTime=null) → Completed (EndTime set)

---

### Feeding

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| Id | Guid | PK | Unique identifier |
| BabyId | Guid | FK → Baby | Baby this record belongs to |
| StartTime | DateTime | Required | When feeding started |
| EndTime | DateTime? | Nullable | When feeding ended (null = active) |
| Type | enum | Breastfeeding/Bottle/Formula | Feeding type |
| Side | enum? | Left/Right/Both | Breast side (nullable for bottle) |
| AmountMl | decimal? | >= 0, nullable | Amount in milliliters (for bottle/formula) |
| Notes | string? | Optional, max 500 | Free-text notes |
| RecordedBy | Guid | FK → Caregiver | Who logged this |
| CreatedAt | DateTime | Auto | Record creation timestamp |
| LastModifiedUtc | DateTime | Auto | Last modification (for sync) |
| SyncStatus | enum | Pending/Synced/Conflict | Offline sync state |

**Validation rules**:
- EndTime must be after StartTime (when set)
- Side is required when Type = Breastfeeding
- AmountMl is required when Type = Bottle or Formula
- Feeding sessions cannot overlap for the same baby

**State transitions**: Active (EndTime=null) → Completed (EndTime set)

---

### DiaperChange

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| Id | Guid | PK | Unique identifier |
| BabyId | Guid | FK → Baby | Baby this record belongs to |
| Timestamp | DateTime | Required | When the change occurred |
| Type | enum | Wet/Soiled/Both/Dry | Diaper content classification |
| Notes | string? | Optional, max 500 | Free-text notes |
| RecordedBy | Guid | FK → Caregiver | Who logged this |
| CreatedAt | DateTime | Auto | Record creation timestamp |
| LastModifiedUtc | DateTime | Auto | Last modification (for sync) |
| SyncStatus | enum | Pending/Synced/Conflict | Offline sync state |

**Validation rules**:
- Timestamp cannot be in the future
- Duplicate prevention: no two changes within 60 seconds for same baby

**Health thresholds** (newborn wet diapers/day):
- 8+ = Healthy ("Great hydration today! 💧")
- 5-7 = Advisory (gentle informational note)
- <5 = Concern (soft suggestion to consult pediatrician)

---

### GrowthMeasurement

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| Id | Guid | PK | Unique identifier |
| BabyId | Guid | FK → Baby | Baby this record belongs to |
| MeasuredAt | DateTime | Required | When measurement was taken |
| WeightKg | decimal | > 0, <= 30 | Weight in kilograms |
| LengthCm | decimal? | > 0, <= 120, nullable | Length/height in centimeters |
| HeadCircumferenceCm | decimal? | > 0, <= 60, nullable | Head circumference in cm |
| Notes | string? | Optional, max 500 | Free-text notes |
| RecordedBy | Guid | FK → Caregiver | Who logged this |
| CreatedAt | DateTime | Auto | Record creation timestamp |
| LastModifiedUtc | DateTime | Auto | Last modification (for sync) |
| SyncStatus | enum | Pending/Synced/Conflict | Offline sync state |

**Validation rules**:
- At least WeightKg must be provided
- Values must be within physiologically possible ranges
- MeasuredAt cannot be before baby's BirthDate

---

### FeedingReminder

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| Id | Guid | PK | Unique identifier |
| BabyId | Guid | FK → Baby | Baby this reminder is for |
| NextDueAt | DateTime | Required | Calculated next feeding time |
| AverageIntervalMinutes | int | > 0 | Current average interval |
| IsActive | bool | Default true | Whether reminder is active |
| OffsetMinutes | int | Default 10 | Minutes before due to notify |
| LastCalculatedAt | DateTime | Auto | When this was last computed |

---

## Enumerations

| Enum | Values |
|------|--------|
| Gender | Male, Female, Other |
| CaregiverRole | Primary, Secondary, ViewOnly |
| SleepQuality | Peaceful, Restless, Fussy, Crying |
| SleepLocation | Crib, Bassinet, CarSeat, Stroller, ParentArms, ParentBed |
| FeedingType | Breastfeeding, Bottle, Formula |
| BreastSide | Left, Right, Both |
| DiaperType | Wet, Soiled, Both, Dry |
| SyncStatus | Pending, Synced, Conflict |

## Entity Relationship Diagram (Textual)

```
Family 1──* FamilyMembership *──1 Caregiver
Family 1──* Baby
Baby 1──* SleepRecord
Baby 1──* Feeding
Baby 1──* DiaperChange
Baby 1──* GrowthMeasurement
Baby 1──0..1 FeedingReminder
SleepRecord *──1 Caregiver (RecordedBy)
Feeding *──1 Caregiver (RecordedBy)
DiaperChange *──1 Caregiver (RecordedBy)
GrowthMeasurement *──1 Caregiver (RecordedBy)
```
