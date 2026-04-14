<div align="center">
  <h1>🏥 MedLayer – Enterprise Clinic Management Platform</h1>
  <p>A highly secure, multi-tenant SaaS architecture for managing clinical networks, coordinating appointments, and strictly enforcing Role-Based Access Control (RBAC).</p>

<div>
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT" />
  </div>
</div>

<br />

## 📖 Executive Summary

MedLayer is a production-grade, fault-tolerant web application designed to solve complex operational challenges within medical networks. Rather than acting as a simple CRUD tool, MedLayer physically maps to the reality of clinical operations by strictly enforcing data isolation between different hospital franchises (Multi-Tenancy) and mathematically ensuring that medical personnel can only interact with patient data they are explicitly authorized to view (RBAC).

---

## 🏗️ 1. Architecture & System Design

MedLayer operates on a **Monolithic Multi-Tenant** architecture. By utilizing a shared database schema heavily partitioned by tenant footprint, the application maximizes hardware efficiency while guaranteeing absolute data integrity.

### The `baseTenantService` Interceptor

To guarantee that one hospital franchise cannot ever accidentally query or leak the patient data of another franchise, the backend routes all major logic through a custom `baseTenantService`.

Instead of trusting the HTTP Controllers to append security filters to database queries, the `baseTenantService` sits directly at the Mongoose ODM execution layer. It intercepts every read/write/update command and automatically binds `{ clinicId: req.user.clinicId }` to the execution query.

* **The Result:** Even if an API endpoint is exploited or a controller is misconfigured, the underlying service layer will physically drop any database request that attempts to cross the multi-tenant boundary.

### Core Data Models & Relationships

- **Clinic**: The root tenant. All other operational data bounds to this ID.
- **User**: The administrative, reception, or medical staff. Requires JWT authentication.
- **Doctor**: Medical personnel profiles. Bound to a `User` entity but isolated for scheduling arrays.
- **Patient**: Global CRM profiles restricted by tenant.
- **Appointment**: The operational "State Machine" that binds a `Doctor`, a `Patient`, and a `Date/Time` together.

---

## 🔐 2. Advanced Role-Based Access Control (RBAC)

Security within MedLayer is entirely decoupled from the UI layer to prevent client-side manipulation.

### The Permissions Matrix (`permissions.js`)

MedLayer avoids hard-coded `if (user.role === 'admin')` statements in APIs. Instead, it relies on a central configuration matrix mapping physical database actions to an array of authorized roles.

```javascript
// Example of the decoupled permission pipeline
CHECKIN_APPOINTMENT: ["admin", "receptionist"],
COMPLETE_APPOINTMENT: ["admin", "receptionist", "doctor"],
VIEW_PATIENT: ["admin", "receptionist", "doctor"]
```

### Operational Access Tiers:

1. **Administrators (System God-Mode)**: Capable of mutating physical clinic settings, managing holistic staff configurations, overriding appointments, and maintaining the global clinic state.
2. **Receptionists (The Operators)**: Authorized to create new patients, execute the initial booking workflows, and strictly advance the appointment state from `BOOKED` to `CHECKED_IN`, acting as the gatekeepers of the clinic flow.
3. **Doctors (Isolated Workers)**: Doctors cannot manipulate the global registry. When a doctor requests a list of patients, the API runs a complex cross-reference against the `Appointment` model, returning *only* those patients who have historically or actively booked an appointment with that specific doctor ID.

---

## ⚙️ 3. Technical Highlights & Custom Engineering

MedLayer circumvents reliance on heavy third-party UI libraries and basic API routing, favoring robust, custom-engineered solutions for enterprise stability.

### 🛡️ Token-Resilient Backend Fallbacks

A major architectural flaw in most session-less JWT applications is that token payloads go stale if a user's database footprint changes mid-session.

* **The Problem:** If an Admin recently assigns a `doctorId` to a User profile, the User's active JWT will not contain this new ID claim.
* **The Engineered Solution:** When `patientService` triggers, it checks the JWT payload. If `req.user.doctorId` is undefined but the role evaluates to `'doctor'`, the backend physically circumvents the token. It triggers a highly optimized `dbUser.findById(user.id)` fallback to silently retrieve the physical `doctorId` from MongoDB mid-flight.
* **The Result:** The API seamlessly self-heals, processing the data securely without forcibly terminating the doctor's active session or requiring a manual re-login.

### 📐 Dynamic UI Collision & Gravity Detection

To achieve a completely custom graphical aesthetic, MedLayer utilizes bespoke React components, notably the `CustomSelect` dropdown.

* **The Problem:** Absolute and Fixed-positioned dropdown menus physically clip and disappear underneath the browser window when rendered near the bottom of a scrollable modal.
* **The Engineered Solution:** The component actively tracks the DOM via `useLayoutEffect`. It runs a mathematical calculation comparing `window.innerHeight` against the trigger button's `getBoundingClientRect()`. If the spatial gap below the button falls beneath `320px`, the component intercepts its own CSS render cycle. It flips its structural gravity to violently render *upwards* instead of downwards, and dynamically squishes its own internal `maxHeight` metric to guarantee it never exceeds the physical constraints of the viewport.

### 🛡️ UI Workflow Guardrails & State Machines

The React interface operates as a strict reflection of the backend State Machine.

* A `BOOKED` appointment physically cannot be clicked by a Doctor. The UI automatically hides the "Check-In" and "Cancel" API calls entirely, rendering a purely cosmetic *"Awaiting Arrival"* badge until the Receptionist manipulates the state.
* Only once an appointment successfully hits `CHECKED_IN` does the React DOM render the *"Complete "* button, shifting control over to the medical personnel.

---

## 🗺️ 4. Comprehensive API Dictionary

All operational routes pass through a highly secure interceptor chain: `[ authMiddleware -> permit("ACTION_NAME") -> wrapAsync(Controller) ]`

### Authentication & Users

| Endpoint            |  Method  | Required Access | Description                                                    |
| :------------------ | :-------: | :-------------- | :------------------------------------------------------------- |
| `/auth/login`     | `POST` | *Public*      | Validates bcrypt hash, generating primary JWT.                 |
| `/auth/register`  | `POST` | *Public*      | Generates a new `Clinic` tenant and associated Admin entity. |
| `/auth/users/:id` | `PATCH` | Admin           | Mutates associated staff accounts (password/role resets).      |

### Appointments (The State Machine)

| Endpoint                              |  Method  | Required Access      | Description                                                                                    |
| :------------------------------------ | :-------: | :------------------- | :--------------------------------------------------------------------------------------------- |
| `/auth/appointments`                |  `GET`  | Admin, Recep, Doctor | Serves the schedule.*(Note: Backend natively applies isolated data-filtration for Doctors).* |
| `/auth/appointments`                | `POST` | Admin, Recep         | Instantiates a new booking, binding `PatientId` to `DoctorId`.                             |
| `/auth/appointments/:id/check-in`   | `PATCH` | Admin, Recep         | Advances a status from `BOOKED` to `CHECKED_IN`.                                           |
| `/auth/appointments/:id/complete`   | `PATCH` | Admin, Recep, Doctor | Terminal state execution. Marks patient session as `COMPLETED`.                              |
| `/auth/appointments/:id/reschedule` | `PATCH` | Admin, Recep         | Mutates the date/time matrix of an existing appointment.                                       |
| `/auth/appointments/:id/notes`      | `PATCH` | Admin, Recep, Doctor | Appends medical text documentation to a completed session.                                     |

### Patients & Medical Personnel

| Endpoint                  |  Method  | Required Access      | Description                                                              |
| :------------------------ | :------: | :------------------- | :----------------------------------------------------------------------- |
| `/auth/patients`        | `GET` | Admin, Recep, Doctor | Yields patient registry. Doctors only receive isolated historic matches. |
| `/auth/patients/search` | `GET` | Admin, Recep, Doctor | Executes regex `$search` arrays against the patient database.          |
| `/auth/patients`        | `POST` | Admin, Recep         | Registers a new global patient entity to the active tenant.              |
| `/auth/doctors`         | `GET` | Admin, Recep         | Returns active medical profiles for scheduling grids.                    |

---

## 📂 5. Project Folder Structure

```text
MedLayer/
├── frontend/               # React SPA Client
│   ├── src/
│   │   ├── api/            # Pre-configured Axios interceptors (JWT injection)
│   │   ├── components/     # Custom UI library (CustomSelect, DatePicker, Navs)
│   │   ├── context/        # AuthProvider (Session persistence)
│   │   ├── pages/          # Full View Modules (Dashboard, Schedule, Registry)
│   │   ├── index.css       # Root Design System (CSS Variables, Dark/Light modes)
│   │   └── App.jsx         # Client-side router map (Protected Routes)
│
├── src/                    # Node.js backend
│   ├── config/             # Environment & `permissions.js` matrix
│   ├── controllers/        # HTTP Request parsing & response execution
│   ├── middlewares/        # Security interceptors (`authMiddleware`, `permit`)
│   ├── models/             # Mongoose schemas (Tenant mapping embedded here)
│   ├── routes/             # Express router declarations
│   ├── services/           # Heavy Business Logic (`baseTenantService` operations)
│   └── server.js           # Physical Node Server & MongoDB binding layer
│
└── .env                    # System variables
```

---

## 🖥️ 6. Local Installation & Setup Environment

To deploy MedLayer into a bare-metal local development environment:

### Prerequisites:

* **Node.js**: v18+ Recommended.
* **MongoDB**: A running local instance (`mongodb://127.0.0.1:27017`) or active Atlas URI.

### Step 1: Repository Extraction

```bash
git clone https://github.com/your-username/MedLayer.git
cd MedLayer
```

### Step 2: Dependency Mapping

The application utilizes independent `package.json` registries to separate server constraints from client rendering constraints.

```bash
# Initialize backend dependencies
npm install

# Initialize frontend dependencies
cd frontend
npm install
cd ..
```

### Step 3: Environment Injection

Generate a `.env` configuration file located perfectly at the root of the standard directory:

```env
MONGO_URI=mongodb://127.0.0.1:27017/medlayer
PORT=8080
JWT_SECRET=generate_a_highly_secure_cryptographic_string_here
```

### Step 4: System Ignition

MedLayer utilizes the `concurrently` package in the root to synchronously fire the API daemon alongside the Vite Hot-Module Replacement server.

```bash
npm run dev
```

* **React Client**: Bootstraps automatically to `http://localhost:5173`
* **Express API**: Begins listening on `http://localhost:8080` (Proxied inherently by the React Client).

---

<div align="center">
  <i>Architected with focus. Built for scale.</i>
</div>
