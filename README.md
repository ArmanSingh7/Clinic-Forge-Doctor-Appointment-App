
# ClinicForge - Doctor Appointment Management System

A full-stack doctor appointment management platform built with **Spring Boot** and **React**, enabling patients to book appointments, doctors to manage schedules, and admins to oversee the entire system.

## Features

### Patient Portal
- Register/Login with secure authentication
- Search and filter doctors by specialization and city
- Book appointments with available time slots
- View appointment history and prescriptions
- Upload and manage medical documents
- Receive real-time notifications

### Doctor Portal
- Manage availability and time slots
- View and manage appointments
- Add prescriptions and medicines
- Track patient history across visits
- View feedback from patients

### Admin Dashboard
- Manage doctors, patients, and appointments
- View system-wide statistics
- Monitor feedback and platform activity

### General
- JWT-based authentication and role-based access control
- Email notifications (appointment confirmations, password reset)
- Swagger API documentation
- Responsive UI with Bootstrap

## Tech Stack

| Layer      | Technology                                                  |
|------------|-------------------------------------------------------------|
| Frontend   | React 19, React Router 7, Bootstrap 5, Axios, Recharts     |
| Backend    | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA |
| Database   | MySQL                                                       |
| Auth       | JWT (jjwt 0.11.5)                                          |
| API Docs   | SpringDoc OpenAPI (Swagger UI)                              |
| Email      | Spring Mail (Gmail SMTP)                                    |
| Build      | Maven (backend), Vite (frontend)                            |

## Project Structure

```
ArmCap/
├── DoctorApp/                  # Spring Boot backend
│   ├── src/main/java/com/doctorapp/
│   │   ├── config/             # Security & Swagger config
│   │   ├── controller/         # REST controllers
│   │   ├── dto/                # Data transfer objects
│   │   ├── entity/             # JPA entities
│   │   ├── exception/          # Global exception handling
│   │   ├── repository/         # Data access layer
│   │   ├── security/           # JWT filter & utility
│   │   └── service/            # Business logic
│   └── src/main/resources/
│       └── application.properties
│
├── doctor-app-frontend/        # React frontend
│   └── src/
│       ├── components/         # Reusable UI components
│       ├── context/            # Auth & Notification context
│       ├── pages/              # Page components by role
│       │   ├── admin/
│       │   ├── auth/
│       │   ├── doctor/
│       │   ├── patient/
│       │   └── public/
│       └── services/           # API service layer
│
└── .env.example                # Required environment variables
```

## Prerequisites

- **Java 17+**
- **Maven 3.8+**
- **Node.js 18+** and **npm**
- **MySQL 8.0+**

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable        | Description                        |
|-----------------|------------------------------------|
| `DB_URL`        | MySQL JDBC connection URL          |
| `DB_USERNAME`   | Database username                  |
| `DB_PASSWORD`   | Database password                  |
| `JWT_SECRET`    | JWT signing key (min 32 chars)     |
| `MAIL_USERNAME` | Gmail address for sending emails   |
| `MAIL_PASSWORD` | Gmail app password                 |

### 3. Start the backend

```bash
cd DoctorApp
mvn spring-boot:run
```

> If using Eclipse: Right-click `DoctorAppApplication.java` → Run As → Java Application.  
> Set environment variables in **Run Configurations → Environment** tab.

The backend runs at **http://localhost:8080**

### 4. Start the frontend

```bash
cd doctor-app-frontend
npm install
npm run dev
```

The frontend runs at **http://localhost:3000**

### 5. Access the app

| URL                                  | Description        |
|--------------------------------------|--------------------|
| http://localhost:3000                 | Application UI     |
| http://localhost:8080/swagger-ui.html | API Documentation  |

## API Modules

| Module          | Base URL              | Description                       |
|-----------------|-----------------------|-----------------------------------|
| Users           | `/api/users`          | Authentication & registration     |
| Patients        | `/api/patients`       | Patient profile & history         |
| Doctors         | `/api/doctors`        | Doctor profiles & availability    |
| Appointments    | `/api/appointments`   | Booking & management              |
| Admin           | `/api/admin`          | System administration             |
| Documents       | `/api/documents`      | Medical document uploads          |
| Feedback        | `/api/feedbacks`      | Patient feedback                  |
| Medicines       | `/api/medicines`      | Prescriptions                     |
| Notifications   | `/api/notifications`  | Real-time notifications           |

## Default Roles

| Role      | Access Level                          |
|-----------|---------------------------------------|
| `PATIENT` | Book appointments, view own records   |
| `DOCTOR`  | Manage schedule, prescribe medicines  |
| `ADMIN`   | Full system access                    |
