# Clinic Forge — README

# 🏥 Clinic Forge

> A full-stack clinic management web application that digitizes appointment booking, prescription management, medical records, and real-time notifications for Patients, Doctors, and Admins.
> 

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [Modules Overview](#modules-overview)
- [API Reference](#api-reference)
- [Authentication & Security](#authentication--security)
- [Database Design](#database-design)
- [Frontend Architecture](#frontend-architecture)
- [User Workflows](#user-workflows)
- [Exception Handling](#exception-handling)
- [Future Works](#future-works)

---

## ✨ Features

| **Stakeholder** | **Capabilities** | 
| --- | --- | --- | --- |
| 👨‍⚕️ Doctor | Manage profile, set availability date ranges, manage time slots, approve/reject/confirm appointments, prescribe medicines, view patient visit history, send email to patients | 🛡️ Admin | Manage all doctors and patients (CRUD), monitor all appointments, view system-wide statistics via dashboard with charts, filter users by city, view documents |
| 🧑‍⚕️ Patient | Register, search doctors by city/specialization/ratings, book appointments with specific time slots, upload medical documents, view prescriptions, provide feedback with ratings, receive real-time notifications |

---

## 🛠 Tech Stack

### Frontend

| **Technology** | **Version** | **Purpose** | React.js | 19.2.4 | Component-based UI library (SPA) |
| --- | --- | --- | --- | --- | --- |
| Vite | Latest | Fast build tool with HMR | React Router DOM | 7.14.0 | Client-side routing with nested & protected routes |
| Axios | 1.14.0 | HTTP client with request/response interceptors | Bootstrap | 5.3.8 | Responsive CSS framework |
| React Bootstrap | 2.10.10 | React wrappers for Bootstrap components | Bootstrap Icons | 1.13.1 | Icon library |
| Recharts | 3.8.1 | Data visualization (Bar & Pie charts) | date-fns | 4.1.0 | Lightweight date formatting |
| react-hot-toast | 2.6.0 | Toast notifications | react-icons | 5.6.0 | Additional icon support |

### Backend

| **Technology** | **Version** | **Purpose** | Spring Boot | 3.2.0 | Application framework with embedded Tomcat |
| --- | --- | --- | --- | --- | --- |
| Java | 17 | Programming language (LTS) | Spring Data JPA / Hibernate | via Boot 3.2 | ORM for database operations |
| Spring Security | via Boot 3.2 | Stateless JWT-based authentication & authorization | Spring Boot Starter Mail | via Boot 3.2 | SMTP email (password reset, doctor-to-patient) |
| JJWT (io.jsonwebtoken) | 0.11.5 | JWT creation, signing (HMAC-SHA256), and parsing | Lombok | Latest | Boilerplate reduction annotations |
| SpringDoc OpenAPI | 2.3.0 | Auto-generated Swagger UI at `/swagger-ui.html` | MySQL Connector/J | Latest | JDBC driver for MySQL |

### Database

| **Property** | **Value** | Engine | MySQL |
| --- | --- | --- | --- |
| Schema Name | `doctor_app` | DDL Strategy | `update` (Hibernate auto-creates/updates tables) |
| Connection URL | `jdbc:mysql://localhost:3306/doctor_app` | Server Port | 8080 |

---

## 🏗 System Architecture

Clinic Forge follows a **client-server monolithic architecture** with a clear separation between the React frontend (presentation layer) and the Spring Boot backend (application + data layer).

```
┌─────────────────────────────────────────────────┐
│                React Frontend (Vite)            │
│  Patient UI | Doctor UI | Admin UI | Public UI  │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS (REST API)
                       │ Authorization: Bearer <JWT>
┌──────────────────────▼──────────────────────────┐
│           Spring Boot Backend (Port 8080)        │
│  Controllers → Services → Repositories → MySQL  │
│  Spring Security (JWT Filter Chain)              │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│              MySQL Database                      │
│  doctor_app schema — 12 tables                  │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Node.js 18+ & npm
- MySQL 8+
- Maven

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/clinic-forge.git
cd clinic-forge/backend

# 2. Configure application.properties
# Set your MySQL credentials and JWT secret:
# spring.datasource.url=jdbc:mysql://localhost:3306/doctor_app
# spring.datasource.username=<your_user>
# spring.datasource.password=<your_password>
# jwt.secret=<min_32_byte_secret>
# spring.mail.username=<your_gmail>
# spring.mail.password=<your_app_password>

# 3. Build and run
mvn spring-boot:run
# Backend runs at http://localhost:8080
# Swagger UI at http://localhost:8080/swagger-ui.html
```

### Frontend Setup

```bash
cd clinic-forge/frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend runs at http://localhost:3000
```

---

## 📦 Modules Overview

### 👤 User Module (`/api/users`)

Handles authentication, registration, and password management.

| **Method** | **Endpoint** | **Access** | **Description** |
| --- | --- | --- | --- |
| POST | `/register/patient` | Public | Register a new patient |
| POST | `/register/admin` | Public | Register a new admin |
| POST | `/reset-password` | Public | Reset password via token |
| DELETE | `/remove` | Authenticated | Remove a user |

**Password Policy:** Min 8 / Max 20 chars · Uppercase · Lowercase · Digit · Special char (`@$!%?&#`)

### 🧑‍⚕️ Patient Module (`/api/patients`)

Manages patient profiles, history, and photo uploads.

### 👨‍⚕️ Doctor Module (`/api/doctors`)

Manages doctor profiles, availability date ranges, time slots, and patient communication.

### 📅 Appointment Module (`/api/appointments`)

Full appointment lifecycle management.

**Status Lifecycle:**

```
PENDING → APPROVED → CONFIRMED
        ↘ REJECTED
Any status → CANCELLED (by Patient, Doctor, or Admin)
```

| **Transition** | **Who Can Perform** | → APPROVED | Doctor, Admin |
| --- | --- | --- | --- |
| → REJECTED | Doctor, Admin | → CONFIRMED | Doctor, Admin |
| → CANCELLED | Doctor, Admin, Patient | Hard Delete | Admin only |

### 🕐 Time Slot & Availability Module

Doctors define availability date ranges (`fromDate` → `endDate`); the system auto-generates 30-minute time slots within those ranges for patients to book.

### 📁 Document Module (`/api/documents`)

Patients and doctors can upload medical documents (PDFs, images). Files are stored at `./uploads/documents/` on the server. Max upload size: **10 MB**.

### ⭐ Feedback Module (`/api/feedbacks`)

Patients submit 1–5 star ratings with optional comments per appointment. Prevents duplicate feedback (409 Conflict).

### 💊 Medicine/Prescription Module (`/api/medicines`)

Doctors add prescriptions per appointment with medicine name, dosage, frequency, duration, and notes. Patients can view their full prescription history.

### 🔔 Notification Module (`/api/notifications`)

Real-time in-app notifications polled every 30 seconds.

| **Event** | **Recipient** | **Type** |
| --- | --- | --- |
| Doctor approves appointment | Patient | `APPOINTMENT_APPROVED` |
| Doctor confirms appointment | Patient | `APPOINTMENT_CONFIRMED` |
| Patient submits feedback | Doctor | `FEEDBACK_RECEIVED` |

---

## 🔐 Authentication & Security

### JWT Authentication

| **Aspect** | **Detail** | Algorithm | HMAC-SHA256 (HS256) |
| --- | --- | --- | --- |
| Token Expiry | 24 hours (86,400,000 ms) | Payload Claims | `sub`, `userId`, `role`, `profileId`, `iat`, `exp` |
| Storage (Client) | `localStorage` | Transmission | `Authorization: Bearer <token>` header via Axios interceptor |
| Session Policy | Fully stateless (`SessionCreationPolicy.STATELESS`) | CSRF | Disabled (stateless JWT — not cookie-based) |

### Role-Based Access Control (RBAC)

Spring Security's `HttpSecurity` enforces fine-grained access per endpoint:

- **`ROLE_PATIENT`** — Book appointments, submit feedback, upload own documents
- **`ROLE_DOCTOR`** — Approve/reject/confirm appointments, prescribe medicines, manage availability
- **`ROLE_ADMIN`** — Full CRUD on all entities, delete appointments, manage users

### Password Security

- Hashed with **BCrypt** via Spring Security's `BCryptPasswordEncoder`
- Validated against regex before hashing during registration
- Password reset via time-limited tokens sent over Gmail SMTP

---

## 🗄 Database Design

The `doctor_app` schema contains **12 tables**:

| **Table** | **Description** |
| --- | --- |
| `patients` | Patient profile, photo (Base64) |
| `admins` | Admin profile |
| `time_slots` | 30-min slots per doctor per date |
| `feedbacks` | 1–5 ratings and comments |
| `medical_documents` | Uploaded file metadata |
| `notifications` | In-app notification storage |

**JPA Repositories:** 11 Spring Data JPA repositories in `repository.jpa` package with custom query methods for filtering by doctor, patient, date, and status.

---

## 🎨 Frontend Architecture

### Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── ProtectedRoute.jsx
│   ├── DashboardLayout.jsx
│   ├── Sidebar.jsx
│   ├── TopNavbar.jsx
│   ├── CitySelect.jsx
│   ├── SpecializationSelect.jsx
│   └── StatusBadge.jsx
├── context/             # Global state providers
│   ├── AuthContext.jsx
│   ├── NotificationContext.jsx
│   └── jwtDecode.js
├── pages/               # Route-level page components
│   ├── public/          # Landing, Login, Register, etc.
│   ├── patient/         # Patient dashboard & features
│   ├── doctor/          # Doctor dashboard & features
│   └── admin/           # Admin dashboard & features
└── services/
    └── api.js           # Centralized Axios instance + 50+ API functions
```

### Context Providers

- **`AuthContext`** — Manages auth state, token decoding, login/logout
- **`NotificationContext`** — Polls unread notifications every 30s, exposes mark-read helpers

### Provider Hierarchy

```jsx
<AuthProvider>
  <NotificationProvider>
    <Router>
      <Toaster />
      <Routes>...</Routes>
    </Router>
  </NotificationProvider>
</AuthProvider>
```

### Routing

| Prefix | Role | Example Routes |
| --- | --- | --- |
| `/` | Public | Landing, Login, Register, Doctors, Services |
| `/patient/*` | `ROLE_PATIENT` | Dashboard, Find Doctors, Appointments, Book, Profile |
| `/doctor/*` | `ROLE_DOCTOR` | Dashboard, Appointments, Patients, Availability, Profile |
| `/admin/*` | `ROLE_ADMIN` | Dashboard, Manage Doctors/Patients/Appointments |

---

## 🔄 User Workflows

### Patient Workflow

1. Register / Login → JWT issued
2. Browse public doctor listings or search by city/specialization
3. Select doctor → pick available date → choose time slot → confirm booking
4. Track appointment status (PENDING → APPROVED → CONFIRMED)
5. Post-visit: view prescriptions, upload documents, submit feedback

### Doctor Workflow

1. Register / Login → JWT issued
2. Set availability date ranges (system auto-generates time slots)
3. Receive notification → approve/reject/confirm appointments
4. Add prescriptions for confirmed appointments
5. View patient history, send emails, manage documents

### Admin Workflow

1. Login with admin credentials
2. Monitor system dashboard (stats, charts, recent activity)
3. Add/edit/remove doctors and patients
4. Manage all appointments (approve, reject, delete)
5. Filter users by city, view documents, review feedbacks

---

## ⚠️ Exception Handling

Centralized via `@RestControllerAdvice` (`GlobalExceptionHandler`):

| **Exception** | **HTTP Status** | **Description** |
| --- | --- | --- |
| `DuplicateResourceException` | 409 Conflict | Unique constraint violation (e.g., duplicate email) |
| `InvalidCredentialsException` | Custom | Invalid login credentials |

---

## 🔮 Future Works

- [ ]  Video consultation / telemedicine integration
- [ ]  Mobile application (React Native or Flutter)
- [ ]  Advanced analytics and reporting exports (PDF/Excel)
- [ ]  Multi-language / i18n support
- [ ]  SMS notifications via Twilio or similar
- [ ]  Payment gateway integration for consultation fees
- [ ]  AI-powered doctor recommendation engine
- [ ]  Microservices migration for scalability

---

