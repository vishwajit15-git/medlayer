# 🏥 MEDLAYER END-TO-END TECHNICAL DOCUMENTATION
*Version 1.0.0 | Definitive Developer & API Guide*

> **Overview**
> MedLayer is an enterprise-grade, multi-tenant backend architecture explicitly constructed for healthcare environments. This document serves as the absolute and exhaustive source of truth for the entire system, detailing every architectural decision, middleware function, database schema, algorithm, and API endpoint to the finest mathematical detail.

---

## 🗂️ TABLE OF CONTENTS
1. [Executive Summary & Architectural Patterns](#1-executive-summary--architectural-patterns)
2. [Infrastructure & Bootstrapping Protocols](#2-infrastructure--bootstrapping-protocols)
3. [Middleware Specifications & Pipeline](#3-middleware-specifications--pipeline)
4. [Comprehensive Data Models (Schemas)](#4-comprehensive-data-models-schemas)
5. [Core Service Algorithms (Helper Functions)](#5-core-service-algorithms-helper-functions)
6. [Exhaustive API Reference](#6-exhaustive-api-reference)
   *   [6.1 Authentication & User Management](#61-authentication--user-management)
   *   [6.2 Clinic Administration](#62-clinic-administration)
   *   [6.3 Doctor Management](#63-doctor-management)
   *   [6.4 Doctor Breaks & Holidays](#64-doctor-breaks--holidays)
   *   [6.5 Patient Management](#65-patient-management)
   *   [6.6 Appointment Scheduling & Lifecycles](#66-appointment-scheduling--lifecycles)
   *   [6.7 Audit & Traceability](#67-audit--traceability)
7. [Technical Debt & Optimization Roadmaps](#7-technical-debt--optimization-roadmaps)

---

## 🏗️ 1. EXECUTIVE SUMMARY & ARCHITECTURAL PATTERNS

MedLayer entirely bypasses primitive MVC (Model-View-Controller) structures in favor of **Domain-Driven Layered Architecture**. The application is built on **Node.js** utilizing **Express 5**, which natively resolves unhandled promise rejections, removing the reliance on verbose `try/catch` wrapper utilities in the route layer.

### System Directory Layout:
*   `src/routes/`: The HTTP interceptors. They define the URI endpoints, mount validation schemas (Joi), and invoke context-specific middlewares (RBAC, Auth). They contain **zero** business logic.
*   `src/controllers/`: The orchestrators. They extract HTTP primitive data (`req.body`, `req.query`, `req.params`, `req.user`), pass them synchronously or asynchronously into the Service layer, and format the final HTTP outbound response (`200 OK`, `201 Created`).
*   **`src/services/`**: The absolute core of the backend. Determines business logic invariants, executes complex mathematical array intersections, queries the Mongoose ODM, and propagates errors upward.
*   `src/middlewares/`: Global or route-specific interceptors that execute prior to controllers. Used for Authentication, Rate Limiting, Sanitization, and Error Catching.
*   `src/models/`: The database structure definitions enforcing MongoDB BSON typing.
*   `src/validators/`: The `Joi` schema files that enforce strict type checking ahead of business logic execution. Protects against NoSQL injection.
*   `src/utils/`: Generic helper classes, notably the `ExpressError.js` extension for semantic HTTP error throwing.
*   `src/docs/`: Swagger definitions leveraging OpenAPI 3.0 specs to generate real-time developer GUI documentation via `swagger-ui-express`.

---

## ⚙️ 2. INFRASTRUCTURE & BOOTSTRAPPING PROTOCOLS

### 2.1 The Entry Point (`server.js`)
The application initiates via `server.js`, executing the following lifecycle:
1.  **Environment Variable Injection**: `require("dotenv").config()` hydrates `process.env`.
2.  **App Import**: Mounts the main Express instance exported from `src/app.js`.
3.  **Database Connection**: Invokes `connectDB()` to establish a persistent state-link with the MongoDB Replica Set.
4.  **Listener Activation**: Binds the Express listener to `process.env.PORT` (or 8080 fallback).

### 2.2 The Express Pipeline (`src/app.js`)
1.  `express.json()` - Parses inbound JSON payloads to `req.body`.
2.  `sanitizeMiddleware` - First-line defense against XSS.
3.  `rateLimiter` - Global DDoS and bruteforce protection.
4.  `loggerMiddleware` - Standardizes request tracing.
5.  `routes` - Main API definitions mounted via `./routes/index.js`.
6.  `swaggerUi` - Binds the `/api-docs` route to the swagger specs.
7.  `errorMiddleware` - The final catch-all net that prevents server crashing.

### 2.3 The Database Connector (`src/config/db.js`)
Utilizes `mongoose.connect()`. The connection expects a MongoDB Replica Set URI (necessary if transactions are ever to be utilized natively). Logs connection state rigidly and executes `process.exit(1)` upon failure.

---

## 🛡️ 3. MIDDLEWARE SPECIFICATIONS & PIPELINE

Every incoming request filters through various middlewares based on origin and designation.

### 3.1 Rate Limiter (`src/middlewares/rateLimiter.js`)
*   **Library**: `express-rate-limit`
*   **Configuration**:
    *   `windowMs`: `15 * 60 * 1000` (15 Minutes)
    *   `max`: `100` (Maximum requests)
    *   `standardHeaders`: `true` (Sends `RateLimit-*` headers to client)
*   **Mechanism**: Defends the authentication endpoints and entire API against scripted bot attacks or DDoS spam by tracking IPs.

### 3.2 Sanitization Middleware (`src/middlewares/sanitizeMiddleware.js`)
*   **Library**: `xss`
*   **Mechanism**: Iterates dynamically over `req.body`, `req.query`, and `req.params`. Checks if entities exist, then converts potentially malicious `<script>` or HTML injection tags into safe strings.
*   **Why**: Protects the database from storing executable client-side code that could compromise an admin viewing an audit log later.

### 3.3 Logger Middleware (`src/middlewares/loggerMiddleware.js`)
*   **Mechanism**: Captures the HTTP Method (`req.method`), URL (`req.originalUrl`), and timestamp natively.
*   **Why**: Crucial for tracking API traffic and debugging slow responses in a production cluster.

### 3.4 Authentication Middleware (`src/middlewares/authMiddleware.js`)
*   **Execution Flow**:
    1.  Extracts the `Authorization` header.
    2.  Verifies the syntax matches `Bearer <token>`. Returns `401 Unauthorized` if malformed.
    3.  Splits the token and invokes `jwt.verify(token, process.env.JWT_SECRET)`.
    4.  If valid, decodes the token payload and attaches explicitly:
        `req.user = { id: decoded.id, clinicId: decoded.clinicId, role: decoded.role }`
    5.  Passes execution to `next()`.
*   **Architecture Benefit**: Controllers downstream never need to parse headers or parse JWTs. They simply rely on `req.user.clinicId` for tenant scoping.

### 3.5 Role Middleware (`src/middlewares/roleMiddleware.js`)
*   **Execution Pattern**: Closure-based high-order function.
*   **Flow**: Takes an array of acceptable roles via the rest operator `...allowedRoles`. 
*   **Validation**: 
    1. Ensures `req.user` exists. 
    2. Runs `allowedRoles.includes(req.user.role)`.
    3. If `false`, throws an `ExpressError` yielding a `403 Forbidden` status.
*   **Why**: Hardcodes zero-trust models. A receptionist cannot accidentally trigger an admin-level delete API.

### 3.6 Global Error Middleware (`src/middlewares/errorMiddleware.js`)
*   **Mechanism**: Arity of 4 `(err, req, res, next)`. Express recognizes this specific signature as the global error handler.
*   **Internal Routing**:
    *   Identifies MongoDB `11000` errors for unique index collisions and returns HTTP `409 Conflict`.
    *   Identifies Mongoose `ValidationError` and maps the objects, returning HTTP `400 Bad Request` with joined string messages.
    *   Identifies instances of custom `ExpressError` (operational errors explicitly thrown) and parses their attached status code dynamically.
    *   Returns a fallback `500 Server Error` for unanticipated runtime crashes.

---

## 🗄️ 4. COMPREHENSIVE DATA MODELS (SCHEMAS)

MedLayer enforces absolute logical isolation via **Tenant Scoping**. Nearly every document holds a `clinicId` referencing the master Clinic entity. This guarantees horizontal security. All schemas employ `timestamps: true` appending `createdAt` and `updatedAt` universally.

### 4.1 Clinic Entity (`models/Clinic.js`)
*   **`name`**: `String`, Required, Trimmed.
*   **`contactEmail`**: `String`, Lowercase, Trimmed.
*   **`phone`**: `String`.
*   **`isActive`**: `Boolean`, Default: `true`.
*   **`workingHours`**: Sub-document.
    *   `startTime`: `String`, Default `"09:00"`.
    *   `endTime`: `String`, Default `"18:00"`.
*   **`settings`**: Sub-document.
    *   `workingDays`: `[String]`, Default: `["MON","TUE","WED","THU","FRI"]`.

### 4.2 User Entity (`models/User.js`)
*   **`email`**: `String`, Required, `unique: true`.
*   **`passwordHash`**: `String`, Required. (Stores Bcrypt hashed cipher).
*   **`role`**: `String`, Enum: `["admin", "receptionist", "doctor"]`, Default: `"admin"`.
*   **`clinicId`**: `ObjectId`, Ref: `"Clinic"`, Required.
*   **`refreshToken`**: `String`, Default: `null`.

### 4.3 Doctor Entity (`models/Doctor.js`)
*   **`name`**: `String`, Required, Trimmed.
*   **`specialization`**: `String`, Required.
*   **`clinicId`**: `ObjectId`, Ref: `"Clinic"`, Required.
*   **`isDeleted`**: `Boolean`, Default: `false`.
*   **`availability`**: Array of sub-documents mapping daily generalized shifts.
    *   `startTime`: `String` (HH:MM), Required.
    *   `endTime`: `String` (HH:MM), Required.

### 4.4 Patient Entity (`models/Patient.js`)
*   **`name`**: `String`, Required.
*   **`age`**: `Number`.
*   **`clinicId`**: `ObjectId`, Ref: `"Clinic"`, Required.
*   **`isDeleted`**: `Boolean`, Default: `false`.

### 4.5 Appointment Entity (`models/Appointment.js`)
The most highly guarded transactional root entity in the system.
*   **`doctorId`**: `ObjectId`, Ref: `"Doctor"`, Required.
*   **`patientId`**: `ObjectId`, Ref: `"Patient"`, Required.
*   **`clinicId`**: `ObjectId`, Ref: `"Clinic"`, Required, Indexed.
*   **`appointmentDate`**: `Date`, Required. Normalize bounding limits applied.
*   **`appointmentTime`**: `String`, Required, Trimmed (`HH:MM`).
*   **`status`**: `String`, Enum: `["BOOKED", "CANCELLED", "COMPLETED", "NO_SHOW", "CHECKED_IN", "AVAILABLE"]`, Default: `"BOOKED"`.
*   **`isDeleted`**: `Boolean`, Default: `false`.
*   **`notes`**: `String`, Default: `null`, Trimmed. Allows doctor to prescribe or add context post-completion.
*   **COMPOUND INDEXING RULES**:
    *   `{ doctorId: 1, appointmentDate: 1, appointmentTime: 1, clinicId: 1 }`
    *   `unique: true`
    *   `partialFilterExpression: { status: "BOOKED" }`
    *   *Purpose: Mathematically impossible to double-book a doctor across the API layer, even amid severe race conditions, because the MongoDB write-lock rejects the BSON insert mapping.*

### 4.6 DoctorBreak Entity (`models/DoctorBreak.js`)
*   **`doctorId`**: `ObjectId`, Required.
*   **`clinicId`**: `ObjectId`, Required.
*   **`date`**: `Date`, Required.
*   **`startTime`**: `String` (HH:MM), Required.
*   **`endTime`**: `String` (HH:MM), Required.
*   **`isDeleted`**: `Boolean`, Default: `false`.

### 4.7 DoctorHoliday Entity (`models/DoctorHoliday.js`)
*   **`doctorId`**: `ObjectId`, Required.
*   **`clinicId`**: `ObjectId`, Required.
*   **`date`**: `Date`, Required.
*   **`isDeleted`**: `Boolean`, Default: `false`.

### 4.8 AuditLog Entity (`models/AuditLog.js`)
Immutable append-only chronological ledger.
*   **`clinicId`**: `ObjectId`, Ref: `"Clinic"`, Required.
*   **`userId`**: `ObjectId`, Ref: `"User"`, Required.
*   **`role`**: `String`, Required.
*   **`action`**: `String` (e.g. `CREATE_APPOINTMENT`), Required.
*   **`entity`**: `String` (Class reference e.g., `Appointment`), Required.
*   **`entityId`**: `ObjectId` (Refers to mutated document), Required.
*   **`meta`**: `Object`, Default: `{}`. Used for extra payload history.

---

## 🧮 5. CORE SERVICE ALGORITHMS (HELPER FUNCTIONS)

The math behind the `src/services/appointmentService.js` relies deeply on time-conversion helper constructs.

### 5.1 `toMinutes(timeStr)`
*   **Signature**: `(timeStr: String "HH:MM") -> Number`
*   **Logic**: Splits by colon, maps to integers. Evaluates logic: `(hours * 60) + minutes`.
*   **Purpose**: Simplifies comparative math (e.g. `is slot > breakStartTime`) integer logic is vastly faster and less error-prone than date object parsing.

### 5.2 `toTimeString(totalMinutes)`
*   **Signature**: `(totalMinutes: Number) -> String "HH:MM"`
*   **Logic**: Uses `Math.floor(totalMinutes / 60)` and modulo `% 60`. Pads outcomes conditionally to "0X".
*   **Purpose**: Reverses mathematical processing outputs back into strings for API consumption and database commits.

### 5.3 `generateSlots(start, end)`
*   **Signature**: `(start: "HH:MM", end: "HH:MM") -> Array["HH:MM"]`
*   **Logic**: While loop running from `start` minutes to `end` minutes, iteratively appending constants (30).
*   **Purpose**: Breaks continuous blocks of time into discrete 30-minute booking grids.

### 5.4 `getDayofWeek(date)`
*   **Signature**: `(date: Date) -> String ("MON", "TUE", etc)`
*   **Logic**: Wraps standardized Javascript `.getDay()` index map array.

### 5.5 `isPastAppointment(date, time)`
*   **Signature**: `(date: Date, time: String) -> Boolean`
*   **Logic**: Infiltrates exact timestamp generation comparing `appointmentDateTime < new Date()`.
*   **Purpose**: Prohibits retroactive status changes like completing an appointment before it happens.

---

## 📡 6. EXHAUSTIVE API REFERENCE

The central hub documenting every single functional mapping executed by the system.

### 6.1 Authentication & User Management

#### POST `/auth/login`
The primary authentication gateway.
*   **Controller**: `userController.loginUser` (Theoretical service layer)
*   **Security Context**: Public. No Bearer required.
*   **Request Body**:
    ```json
    {
      "email": "admin@clinic.com", // String, required
      "password": "secure123"      // String, required
    }
    ```
*   **Service Logic Flow**:
    1.  Searches `User` repository by email.
    2.  Validates `passwordHash` against `bcrypt.compare`.
    3.  If valid, generates access-level Bearer Token `jwt.sign({id, clinicId, role}, secret, {expiresIn: '7d'})`.
*   **Response Body (`200 OK`)**:
    ```json
    {
      "message": "Login successful",
      "token": "eyJhb...",
      "user": { "id": "uuid", "clinicId": "uuid", "role": "admin" }
    }
    ```
*   **Error Responses**:
    *   `401 Unauthorized`: "Invalid credentials"

#### POST `/auth/users`
Creates subsequent system users for a tenant.
*   **Controller**: `userController.createUser`
*   **Security Context**: Requires Bearer. Allowed Roles: `["admin"]`.
*   **Request Body**:
    ```json
    {
      "email": "reception@clinic.com", 
      "password": "securepassword99", 
      "role": "receptionist" // Enum: receptionist | doctor | admin
    }
    ```
*   **Service Logic Flow**:
    1.  Validates payload constraints.
    2.  `bcrypt.hash` generates the password salt.
    3.  Inherits the exact `clinicId` payload from the Admin `req.user.clinicId` who executes the request (Ensures receptionist belongs to specific clinic).
    4.  Saves to DB.
*   **Response Body (`201 Created`)**:
    ```json
    {
      "message": "User created successfully",
      "user": { "email": "...", "role": "..." }
    }
    ```
*   **Error Responses**:
    *   `409 Conflict`: Duplicate Email exists.
    *   `403 Forbidden`: Requesters without admin privileges.

---

### 6.2 Clinic Administration

#### POST `/auth/register-clinic`
Initializes a new Tenant isolation layer natively.
*   **Security Context**: Public (Onboarding Step).
*   **Request Body**:
    ```json
    {
      "clinicName": "Global Medical Center",
      "email": "master@globalmed.com",
      "password": "AdminPassword123"
    }
    ```
*   **Service Logic Flow**:
    1.  Creates `Clinic` document first (`{ name: clinicName }`).
    2.  Retrieves resulting `ObjectId`.
    3.  Creates `User` document with role `"admin"` bound to newly created `Clinic.ObjectId`. 
    4.  *(Transactional mapping conceptually executed here).*
*   **Response (`201 Created`)**:
    Returns success message and logs.

#### PUT `/auth/clinic/settings`
Updates global tenant configurations governing all doctors inside.
*   **Security Context**: Allowed Roles: `["admin"]`.
*   **Request Body**:
    ```json
    {
      "workingHours": {
        "startTime": "08:00",
        "endTime": "20:00"
      },
      "settings": {
        "workingDays": ["MON", "TUE", "WED", "THU", "FRI", "SAT"]
      }
    }
    ```
*   **Response Body (`200 OK`)**: Returns modified settings structure.

---

### 6.3 Doctor Management

#### POST `/auth/doctors`
Registers a new physician within the executing Tenant's clinic.
*   **Security Context**: Allowed Roles: `["admin"]`.
*   **Request Body**:
    ```json
    {
      "name": "Dr. Gregory House",
      "specialization": "Diagnostic Medicine",
      "availability": [
        { "startTime": "09:00", "endTime": "12:00" },
        { "startTime": "14:00", "endTime": "17:00" }
      ]
    }
    ```
*   **Service Flow**:
    1.  Appends `clinicId` from incoming `req.user`.
    2.  Maps the availability shifts mapping required to resolve mathematical time scheduling.
*   **Response (`201 Created`)**:
    Success wrapper returning resulting doctor JSON object.

#### GET `/auth/doctors`
Lists purely active (non-deleted) physicians under the tenant flag.
*   **Security Context**: Common Endpoints.
*   **Query Strings**: Supports pagination optionally (page, limit).
*   **Service Logic**: `Doctor.find({ clinicId: req.user.clinicId, isDeleted: false })`.
*   **Response (`200 OK`)**: Array of Doctor documents.

#### DELETE `/auth/doctors/{id}`
Removes a doctor from the system without corrupting past appointment logs.
*   **URL Parameter**: `id` (Doctor's ObjectId).
*   **Security Context**: Allowed Roles `["admin"]`.
*   **Service Logic**: Executes `Doctor.findOneAndUpdate({ _id: id, clinicId: user.clinicId }, { isDeleted: true })`.
*   **Response (`200 OK`)**: Successful purge message.

#### GET `/auth/doctors/{doctorId}/available-slots`
*THE MOST IMPORTANT ALGORITHMIC API IN MEDLAYER*. Calculates what time chunks the patient is theoretically allowed to click on in the frontend.
*   **Query Parameter**: `date=YYYY-MM-DD` (Required, string format).
*   **URL Parameter**: `doctorId` (Required).
*   **Security Context**: All Authenticated.
*   **Service Logic Flow** (`appointmentService.js:getAvailableSlots`):
    1. Grabs Clinic config. Verifies day of week matching array.
    2. Grabs `DoctorHoliday`. Drops entirely if matched.
    3. Runs `generateSlots` resolving exact blocks of 30 minutes from all arrays found in `doctor.availability`.
    4. Truncates any slots falling prior to `clinic.startTime` or post `clinic.endTime`.
    5. Checks `DoctorBreak`. Generates an array of break blocks, inserts to Set.
    6. Checks `Appointment` database fetching where `{ clinicId, doctorId, date, status: 'BOOKED' }`. Inserts times to Set.
    7. Subtraction Array filter operation comparing the master shift time mapping against the Set.
*   **Response Body (`200 OK`)**:
    ```json
    {
      "doctorId": "64...",
      "date": "2026-03-30",
      "availableSlots": [
        "09:00", "09:30", "10:30", "11:00", "14:00", "14:30"
      ]
    }
    ```
    *Note: "10:00" natively missing likely due to an existing BOOKED state.*

#### GET `/auth/doctors/{doctorId}/schedule`
Produces the holistic, multi-state grid representing a doctor's total operational day.
*   **Query**: `date=YYYY-MM-DD`
*   **Service Logic Flow**: Identical initialization to `getAvailableSlots`. However, instead of removing broken slots mathematically, iterates arrays and assigns string labels marking constraints.
*   **Response Body (`200 OK`)**:
    ```json
    {
      "doctorId": "64...",
      "date": "2026-03-30",
      "schedule": [
        { "time": "09:00", "status": "AVAILABLE" },
        { "time": "09:30", "status": "BOOKED" },
        { "time": "10:00", "status": "BREAK" }
      ]
    }
    ```

---

### 6.4 Doctor Breaks & Holidays

#### POST `/auth/doctor-breaks`
Allows doctors/administrators to mark precise inter-shift time offline.
*   **Security Context**: Common Roles.
*   **Request Body**:
    ```json
    {
      "doctorId": "64xyz...",
      "date": "2026-03-30",
      "startTime": "13:00",
      "endTime": "14:00"
    }
    ```
*   **Response**: `201 Created` confirmation. Data feeds directly into the scheduling algorithm logic for `available-slots`.

#### POST `/auth/doctor-holidays`
Completely overrides shifts, breaks, and bounds logic. Blocks an entire canonical date.
*   **Request Body**:
    ```json
    {
      "doctorId": "64xyz...",
      "date": "2026-04-15"
    }
    ```
*   **Response**: `201 Created`. Algorithms immediately yield empty array if Holiday bounds exist.

---

### 6.5 Patient Management

#### POST `/auth/patients`
Enters new patient metadata linked directly to the tenant's registry.
*   **Request Body**:
    ```json
    {
      "name": "Jane Doe",
      "age": 34
    }
    ```
*   **Response Body**: `{ "message": "Patient created successfully", "patient": {...} }`.

#### GET `/auth/patients/search`
Retrieves potential matches for receptionist autocomplete typing tasks.
*   **Query String Parameter**: `name=searchString`
*   **Service Logic Flow**: Executes Mongo regex lookups `Patient.find({ clinicId, isDeleted: false, name: { $regex: query, $options: "i" } })`.
*   **Response Body**: Array of matching `Patient` objects.

---

### 6.6 Appointment Scheduling & Lifecycles

The core operational pivot of the entire business logical application.

#### POST `/auth/appointments`
Executes strict reservation of system resources.
*   **Validation**: Uses `Joi` `appointmentSchema` enforcing Date formatting and Regex matching for `appointmentTime` (`/^(?:[01]\d|2[0-3]):(00|30)$/`).
*   **Request Body**:
    ```json
    {
      "doctorId": "507f1f77bcf86cd799439011",
      "patientId": "507f191e81fcd799439011",
      "appointmentDate": "2026-03-30",
      "appointmentTime": "14:30"
    }
    ```
*   **Service Logic Flow**:
    1.  Verifies presence of Doctor and Patient objects natively scoped to `user.clinicId`. Returns `404` if falsified.
    2.  Pulls Clinic settings parsing the Day bounds. Returns `400` "Clinic Closed" if out of bounds.
    3.  Evaluates `appointmentTime` string converting to minutes. Validates numeric magnitude exists exclusively between `clinicStart` and `clinicEnd`. Returns `400` "Outside Clinic working hours".
    4.  Audits `DoctorHoliday`. Returns `400` "Doctor is on Holiday".
    5.  Evaluates `appointmentTime` against Doctor `availability` shift arrays ensuring intersection boundary match.
    6.  Generates exact break intervals mapping overlapping arrays. Returns `400` "Slot you are booking falls under Break".
    7.  Attempts to `Appointment.create({})`.
    8.  If MongoDB composite indices collide (meaning a concurrent race-condition attempted to write exactly identical fields), catches error `11000`, remaps, and returns `409` "Slot already booked".
    9.  Triggers `auditLogService.logAction(CREATE_APPOINTMENT)`.
*   **Response (`201 Created`)**:
    ```json
    {
      "message": "Appointment booked successfully",
      "appointment": { "id", "doctorId", "status": "BOOKED", ... }
    }
    ```

#### GET `/auth/appointments`
Retrieves reservations displaying relational bindings mapped efficiently via Mongoose `.populate()`.
*   **Query String Options**:
    *   `page` (default 1)
    *   `limit` (default 10)
    *   `doctorId` (optional specific target)
    *   `status` (optional string mapping)
    *   `date` (optional normalized string constraint)
*   **Dynamic Fallback Logic**: If no query parameters are provided, automatically calculates logic establishing current day constraints fetching ONLY "Today's Booked Appointments".
*   **Response Body (`200 OK`)**:
    ```json
    {
      "page": 1,
      "limit": 10,
      "total": 4,
      "appointments": [
        {
          "appointmentDate": "...",
          "appointmentTime": "...",
          "status": "BOOKED",
          "doctorId": { "_id": "...", "name": "Dr House", "specialization": "Diagnostic" },
          "patientId": { "_id": "...", "name": "Jane", "age": 34 }
        }
      ]
    }
    ```

#### PATCH `/auth/appointments/{id}/reschedule`
Modifies the time dimension of an existing reservation.
*   **Conditioning**: Target execution fails resolving a `400` constraint if initial reservation status has surpassed `"BOOKED"`. Additionally fails preventing "Back to the Future" scenarios utilizing `isPastAppointment()` bounds checks.
*   **Request Body**:
    ```json
    {
      "appointmentDate": "2026-04-02",
      "appointmentTime": "09:00"
    }
    ```
*   **Database Implication Flow**: Rewrites time coordinates attempting a synchronous `.save()`. Will safely trigger a `409 Conflict` index barrier if the new designation is contemporaneously occupied. Returns `200 OK`.

#### PATCH `/auth/appointments/{id}/check-in`
Triggers progression into dynamic Waiting Room status.
*   **Service Invocation Flow**: Validated `BOOKED` state target. Overwrites configuration variable declaring status `"CHECKED_IN"`.
*   **Logging Obligation**: Triggers `auditLogService.logAction(CHECKIN_APPOINTMENT)` preserving operational lifecycle.
*   **Response Body**: Re-serializes the mutated document confirming application persistence `200 OK`.

#### PATCH `/auth/appointments/{id}/complete`
Allows physicians exclusively to denote finalization of session parameters.
*   **Service Invocation Flow**: Target must belong unequivocally to `"BOOKED"` or `"CHECKED_IN"` structures. Further mathematical limitation evaluating `isPastAppointment()` prevents completing futures prior to sequential temporal achievement.
*   **Mutation Logic**: Converts schema field `status` explicitly to `"COMPLETED"`.
*   **Response**: Returns `{ message: "Appointment completed", appointment: {...} }`.

#### PATCH `/auth/appointments/{id}/notes`
Post-consultation metadata application exclusively executing on completed structures.
*   **Conditioning**: Hard-halts returning `400` unless primary validation state is `"COMPLETED"`.
*   **Request Body**:
    ```json
    {
      "notes": "Administered 50mg standard. Followup in 7 days."
    }
    ```
*   **Logging Obligation**: Forces documentation trail triggering action identifier `"ADD_NOTES"`.
*   **Response**: Emits success message and modified internal payload structure `200 OK`.

#### PATCH `/auth/appointments/{id}/cancel`
Provides termination of future bookings relinquishing hardware grid coordinates for subsequent population.
*   **Conditioning**: Terminates natively evaluating `400` conditional if system clock overrides mathematical limitations (`isPastAppointment()` equates to true).
*   **Mutation Logic**: Reassigns constraint `status` resolving definitively exactly to `"CANCELLED"`.
*   **Logging Obligation**: Resolves an Audit Log action mapping exactly `"CANCEL_APPOINTMENT"`.
*   **Response**: `200 OK`. Schedule calculation grids natively drop parsing constraints mapped to cancelled attributes, fundamentally opening system slots for consumption automatically utilizing Mongo logic limits.

#### GET `/auth/appointments/bulk`
Data Analytics interface returning extremely dense payload counts supporting external export functionality.
*   **Query Strings Required**: `startDate` and `endDate` boundary conditions.
*   **Return Size Override**: Eliminates fractional pagination bindings defining flat bounds up to `.limit(500)` elements fetched per call.
*   **Usage Case**: Intended exclusively for background analytics systems parsing the API externally for intelligence or billing resolutions.

---

### 6.7 Audit & Traceability

#### GET `/auth/audit-logs`
Provides transparent, read-only analysis arrays determining internal mutation responsibilities.
*   **Access Paradigm**: Exclusively `admin` RBAC configuration.
*   **Mechanic Execution**: Evaluates simple MongoDB query extraction logic parsing `AuditLog.find({ clinicId: req.user.clinicId })`.
*   **Response Shape**:
    ```json
    [
      {
        "action": "CREATE_APPOINTMENT",
        "entity": "Appointment",
        "entityId": "64zxy...",
        "userId": "64adminUUID...",
        "role": "admin",
        "createdAt": "2026-03-27T14:32:00.000Z"
      }
    ]
    ```

---

## 🛑 7. TECHNICAL DEBT & OPTIMIZATION ROADMAPS

While functionally robust, certain architectures within MedLayer require future adaptation specifically focusing on enterprise scale limits exceeding 100,000+ daily requests limit constraints.

1.  **Iterative N+1 Data Writes in Retrieval Pipelines**:
    In `/auth/appointments` GET queries, evaluating the loop sequential array iterator replacing the static `.status` field directly to `"NO_SHOW"` triggers continuous synchronous sequential MongoDB block writes blocking natively. These should emphatically route externally into background `node-cron` or `BullMQ` asynchronous pipelines decoupling data acquisition directly separating API read/write loads strictly mathematically.
2.  **Sequential Session Transaction Weaknesses**:
    The system fires parallel synchronous commands saving the Appointment and saving the Audit Log sequentially. A crash interval traversing the microsecond parsing exactly between those executions leads natively immediately to Audit Log orphaned gaps or missed writes. All critical actions moving forward require native Mongoose `session.startTransaction()` wrappings to establish fundamental rollback safety bounds natively across Mongo replica parameters implicitly guaranteeing atomicity structures natively.
3.  **Configurable Pagination Omissions**:
    The Analytics logic `bulk` relies totally functionally entirely natively mapping explicit limits mapping precisely to `.limit(500)` rather than invoking `skip()` or cursor pointers implicitly mapping offset mechanics inherently dropping intelligence capabilities fundamentally beyond threshold mappings limiting strictly.

---
> **End of Technical Specification Configuration**
> Explicitly modeled analyzing internal structural schemas mapping precisely dynamically generated arrays and MongoDB operational scopes defining absolute complete infrastructure operational configurations required internally.
