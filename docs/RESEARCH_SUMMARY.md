# QR Geofence Patrol - Research Summary

## 1. html5-qrcode (Primary QR Scanner Library)

**Repository**: `mebjas/html5-qrcode`  
**Purpose**: Cross-platform JavaScript QR Code and Barcode scanning library for the web.

### Key APIs to Use:

```typescript
// 1. Get available cameras
const cameras = await Html5Qrcode.getCameras();
// Returns: Array<{ id: string, label: string }>

// 2. Initialize scanner (Low-level API - recommended for custom UI)
const html5QrCode = new Html5Qrcode("reader-element-id", {
    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
    verbose: false
});

// 3. Start scanning with camera ID
await html5QrCode.start(
    cameraId,  // OR { facingMode: "environment" } for back camera
    {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false
    },
    (decodedText, decodedResult) => { /* success */ },
    (errorMessage, error) => { /* error per frame (ignore) */ }
);

// 4. Stop scanning
await html5QrCode.stop();

// 5. Get camera capabilities (while scanning)
const capabilities = html5QrCode.getRunningTrackCapabilities();
// Includes: zoom, torch (flash), etc.
```

### Best Practices:
- Use `Html5Qrcode` (low-level) instead of `Html5QrcodeScanner` for custom UI
- Support `{ facingMode: "user" }` for PC webcams and `{ facingMode: "environment" }` for mobile back cameras
- Always call `stop()` before unmounting the component
- Use `formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]` to improve performance

---

## 2. kibotu/geofencer (Android Geofencing Library)

**Purpose**: Convenience library for geofence events with background support.

### Key Concepts:

```kotlin
// Geofence Model
data class Geofence(
    val id: String,           // UUID
    var latitude: Double,     // -90 to +90
    var longitude: Double,    // -180 to +180
    var radius: Double,       // Meters
    var title: String,
    var message: String,
    var transitionType: Int   // ENTER, EXIT, or DWELL
)

// Transition Types
GEOFENCE_TRANSITION_ENTER = 1
GEOFENCE_TRANSITION_EXIT = 2
GEOFENCE_TRANSITION_DWELL = 4  // User stays in area for loitering_delay
```

### Configurable Parameters:
```xml
<integer name="loitering_delay">1</integer>
<integer name="notification_responsiveness">1</integer>
<integer name="expiration_duration">-1</integer>  <!-- -1 = NEVER_EXPIRE -->
```

### Pattern to Apply:
- Store geofences with `id`, `lat`, `lng`, `radius`, and `transitionType`
- For patrol, we primarily care about `ENTER` (inspector reaches checkpoint)
- Track **dwell time** to ensure inspector spent adequate time at checkpoint

---

## 3. MultiQoSTechnologies/geofence-tracking (Android Jetpack Compose)

**Purpose**: Track when users enter/exit geofences and calculate duration of stay.

### Key Implementation Pattern:

```kotlin
// GeofenceNotificationReceiver.kt
when (geofenceTransition) {
    GEOFENCE_TRANSITION_ENTER -> {
        geofenceEnterTime = System.currentTimeMillis()
        // Send notification: "You have entered a geofence area"
    }
    GEOFENCE_TRANSITION_EXIT -> {
        geofenceExitTime = System.currentTimeMillis()
        val duration = geofenceExitTime - geofenceEnterTime
        // Send notification: "You stayed for X minutes"
    }
}
```

### Features to Implement:
1. **Entry Time Tracking**: Record when inspector enters checkpoint radius
2. **Exit Time Tracking**: Record when inspector leaves
3. **Duration Calculation**: `exitTime - enterTime`
4. **Minimum Dwell Time Validation**: Ensure inspector stayed at least X seconds

---

## 4. QRGuardian (Flutter Patrol System)

**Repository**: `ParthJ1411/QRGuardian--Patrolling-and-Attendance-System`  
**Purpose**: Complete attendance and patrolling system using QR codes + geofencing.

### Architecture Insights (from README):
> "QRGuardian provides a robust platform for businesses, educational institutions, and security firms to effectively manage personnel and assets."

### Features to Replicate:
1. **QR Code Checkpoint Verification**: Each checkpoint has a unique QR code
2. **Geofence Validation**: User must be within radius to scan
3. **Patrol Route Management**: Ordered sequence of checkpoints
4. **Attendance/Time Tracking**: Record when each checkpoint was visited
5. **Offline Support**: Store scans locally when network unavailable

---

## Implementation Recommendations for Safety Patrol

### 1. Scanner Component (Using html5-qrcode)
```tsx
// Already implemented in src/components/Scanner.tsx
// Key improvements based on research:
- Support camera selection dropdown
- Handle permission errors gracefully
- Auto-stop on successful scan
- Show scanning indicator
```

### 2. Geofencing Logic (Already in src/lib/geofence.ts)
```typescript
// Current implementation is good. Possible enhancements:
- Add transition types (ENTER/EXIT/DWELL)
- Track entry/exit timestamps
- Calculate dwell duration
```

### 3. Patrol Workflow Enhancement
Based on the research, enhance the patrol flow:

```typescript
interface PatrolCheckpointVisit {
    checkpointId: string;
    scannedAt: Date;
    enteredGeofenceAt?: Date;
    exitedGeofenceAt?: Date;
    dwellDurationSeconds?: number;
    locationAtScan: { lat: number; lng: number };
    distanceFromCheckpoint: number;
    status: 'pending' | 'verified' | 'skipped' | 'failed';
}

interface ActivePatrol {
    routeId: string;
    startedAt: Date;
    completedAt?: Date;
    inspectorId: string;
    visits: PatrolCheckpointVisit[];
}
```

### 4. Next Steps
1. ✅ Scanner with html5-qrcode (done)
2. ✅ Geofence validation (done)
3. ⏳ Patrol session tracking (record visits)
4. ⏳ Inspection form after verification
5. ⏳ Offline support with sync
6. ⏳ Patrol reports and dashboard

---

## File References

| Project | Key Files |
|---------|-----------|
| html5-qrcode | `src/html5-qrcode.ts`, `src/camera/retriever.ts` |
| geofencer | `models/Geofence.kt`, `Geofencer.kt`, `GeofenceRepository.kt` |
| geofence-tracking | `GeofenceNotificationReceiver.kt`, `MapViewModel.kt` |
| QRGuardian | Flutter web build (compiled) |
