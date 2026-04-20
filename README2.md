---
title: CLINIC FORGE
---

# Contents {#contents .TOC-Heading}

[1. Introduction [1](#_Toc227327887)](#_Toc227327887)

[2. Objectives [4](#objectives)](#objectives)

[3. System Architecture [5](#system-architecture)](#system-architecture)

[Architecture Flow [5](#architecture-flow)](#architecture-flow)

[4. Technology Stack [6](#technology-stack)](#technology-stack)

[Frontend: [6](#frontend)](#frontend)

[Backend: [7](#backend)](#backend)

[Database: [8](#database)](#database)

[5. Modules Description [8](#modules-description)](#modules-description)

[5.1 User Entity [8](#user-entity)](#user-entity)

[5.1.2 API endpoints [9](#api-endpoints)](#api-endpoints)

[5.1.3 Password Policy: [9](#password-policy)](#password-policy)

[5.1.4 Password Reset Flow: [10](#password-reset-flow)](#password-reset-flow)

[5.2 Patient Entity [10](#patient-entity)](#patient-entity)

[**5.3 Doctor Module** (url : /api/doctors) [13](#doctor-module-url-apidoctors)](#doctor-module-url-apidoctors)

[**5.4 Appointment Module** (url : /api/appointments) [14](#appointment-module-url-apiappointments)](#appointment-module-url-apiappointments)

[5.5 Time Slot & Availability Module [16](#time-slot-availability-module)](#time-slot-availability-module)

[5.6 Admin Module [17](#admin-module)](#admin-module)

[**5.7 Document Module** (url : /api/documents) [19](#document-module-url-apidocuments)](#document-module-url-apidocuments)

[5.8 Feedback Module [20](#feedback-module)](#feedback-module)

[5.9 Medicine/Prescription Module (url: /api/medicines) [21](#medicineprescription-module-url-apimedicines)](#medicineprescription-module-url-apimedicines)

[5.10 Notification Module [22](#notification-module)](#notification-module)

[6. Database Design [24](#database-design)](#database-design)

[6.1 Entity-Relationship Summary [24](#entity-relationship-summary)](#entity-relationship-summary)

[6.2 Table Definitions [24](#table-definitions)](#table-definitions)

[6.3 JPA Repositories [25](#jpa-repositories)](#jpa-repositories)

[7. Authentication And Security [26](#authentication-and-security)](#authentication-and-security)

[7.1 JWT Authentication [26](#jwt-authentication)](#jwt-authentication)

[7.2 JWT Filter Chain [26](#jwt-filter-chain)](#jwt-filter-chain)

[7.3 Role-Based Access Control (RBAC) [27](#role-based-access-control-rbac)](#role-based-access-control-rbac)

[7.4 Password Security [29](#password-security)](#password-security)

[7.5 Session Management [30](#session-management)](#session-management)

[7.6 CSRF Protection [30](#csrf-protection)](#csrf-protection)

[8. User Workflows [31](#user-workflows)](#user-workflows)

[8.1 Patient Workflow [31](#patient-workflow)](#patient-workflow)

[8.2 Doctor Workflow [31](#doctor-workflow)](#doctor-workflow)

[8.3 Admin Workflow [32](#admin-workflow)](#admin-workflow)

[9. Exception Handling [33](#exception-handling)](#exception-handling)

[9.1 Global Exception Handler [33](#global-exception-handler)](#global-exception-handler)

[9.2 Custom Exceptions [33](#custom-exceptions)](#custom-exceptions)

[10. Frontend Architecture [34](#frontend-architecture)](#frontend-architecture)

[10.1 Directory Structure: [34](#directory-structure)](#directory-structure)

[11. Context Providers(Global State) [35](#context-providersglobal-state)](#context-providersglobal-state)

[11.1 AuthContext (context/AuthContext.jsx) [35](#authcontext-contextauthcontext.jsx)](#authcontext-contextauthcontext.jsx)

[11.2 NotificationContext (context/NotificationContext.jsx) [35](#notificationcontext-contextnotificationcontext.jsx)](#notificationcontext-contextnotificationcontext.jsx)

[11.3 Custom JWT Decoder (context/jwtDecode.js) [35](#custom-jwt-decoder-contextjwtdecode.js)](#custom-jwt-decoder-contextjwtdecode.js)

[12. Reusable Components [36](#reusable-components)](#reusable-components)

[**12.1 ProtectedRoute** (components/ProtectedRoute.jsx) [36](#protectedroute-componentsprotectedroute.jsx)](#protectedroute-componentsprotectedroute.jsx)

[**12.2 Dashboard Layout** (components/DashboardLayout.jsx) [36](#dashboard-layout-componentsdashboardlayout.jsx)](#dashboard-layout-componentsdashboardlayout.jsx)

[**12.3 Sidebar** (components/Sidebar.jsx) [36](#sidebar-componentssidebar.jsx)](#sidebar-componentssidebar.jsx)

[**12.4 TopNavbar** (Components/TopNavbar.jsx) [37](#topnavbar-componentstopnavbar.jsx)](#topnavbar-componentstopnavbar.jsx)

[12.5 CitySelect (components/CitySelect.jsx) [37](#cityselect-componentscityselect.jsx)](#cityselect-componentscityselect.jsx)

[**12.6 SpecializationSelect (**components/SpecializationSelect.jsx) [37](#specializationselect-componentsspecializationselect.jsx)](#specializationselect-componentsspecializationselect.jsx)

[**12.7 StatusBadge (**components/StatusBadge.jsx) [38](#statusbadge-componentsstatusbadge.jsx)](#statusbadge-componentsstatusbadge.jsx)

[13. Routing Architecture [38](#routing-architecture)](#routing-architecture)

[13.1 Provider Hierarchy [38](#provider-hierarchy)](#provider-hierarchy)

[13.2 Route Map [39](#route-map)](#route-map)

[14. API Service Layer [41](#api-service-layer)](#api-service-layer)

[14.1 Axios Configuration [41](#axios-configuration)](#axios-configuration)

[14.2 API Functions by Module [41](#api-functions-by-module)](#api-functions-by-module)

[15. Page-by-Page Feature Details [45](#page-by-page-feature-details)](#page-by-page-feature-details)

[15.1 Landing Page (LandingPage.jsx) [45](#landing-page-landingpage.jsx)](#landing-page-landingpage.jsx)

[15.2 Login Page (Login.jsx) [45](#login-page-login.jsx)](#login-page-login.jsx)

[15.3 Register Page (Register.jsx) [45](#register-page-register.jsx)](#register-page-register.jsx)

[15.4 Password Recovery Pages [46](#password-recovery-pages)](#password-recovery-pages)

[15.5 Public Pages [46](#public-pages)](#public-pages)

[15.6 Patient Dashboard (PatientDashboard.jsx) [46](#patient-dashboard-patientdashboard.jsx)](#patient-dashboard-patientdashboard.jsx)

[15.7 Find Doctors (FindDoctors.jsx) [46](#find-doctors-finddoctors.jsx)](#find-doctors-finddoctors.jsx)

[15.8 Book Appointment (BookAppointment.jsx) [47](#book-appointment-bookappointment.jsx)](#book-appointment-bookappointment.jsx)

[15.9 Patient Appointments (PatientAppointments.jsx) [47](#patient-appointments-patientappointments.jsx)](#patient-appointments-patientappointments.jsx)

[15.10 Patient Profile (PatientProfile.jsx) [48](#patient-profile-patientprofile.jsx)](#patient-profile-patientprofile.jsx)

[15.11 Doctor Dashboard (DoctorDashboard.jsx) [48](#doctor-dashboard-doctordashboard.jsx)](#doctor-dashboard-doctordashboard.jsx)

[15.12 Doctor Appointments (DoctorAppointments.jsx) [48](#doctor-appointments-doctorappointments.jsx)](#doctor-appointments-doctorappointments.jsx)

[15.13 Doctor Patients (DoctorPatients.jsx) [49](#doctor-patients-doctorpatients.jsx)](#doctor-patients-doctorpatients.jsx)

[15.14 Doctor Availability (DoctorAvailability.jsx) [49](#doctor-availability-doctoravailability.jsx)](#doctor-availability-doctoravailability.jsx)

[15.15 Doctor Feedbacks (DoctorFeedbacks.jsx) [49](#doctor-feedbacks-doctorfeedbacks.jsx)](#doctor-feedbacks-doctorfeedbacks.jsx)

[15.16 Doctor Profile (DoctorProfile.jsx) [49](#doctor-profile-doctorprofile.jsx)](#doctor-profile-doctorprofile.jsx)

[15.17 Admin Dashboard (AdminDashboard.jsx) [49](#admin-dashboard-admindashboard.jsx)](#admin-dashboard-admindashboard.jsx)

[15.18 Manage Doctors (ManageDoctors.jsx) [50](#manage-doctors-managedoctors.jsx)](#manage-doctors-managedoctors.jsx)

[15.19 Manage Patients (ManagePatients.jsx) [50](#manage-patients-managepatients.jsx)](#manage-patients-managepatients.jsx)

[15.20 Manage Appointments (ManageAppointments.jsx) [50](#manage-appointments-manageappointments.jsx)](#manage-appointments-manageappointments.jsx)

[15.21 Admin Feedbacks (AdminFeedbacks.jsx) [50](#admin-feedbacks-adminfeedbacks.jsx)](#admin-feedbacks-adminfeedbacks.jsx)

[15.22 Notifications (Notifications.jsx --- Shared) [51](#notifications-notifications.jsx-shared)](#notifications-notifications.jsx-shared)

[16. Future Works [52](#future-works)](#future-works)

[17. Features Overview [52](#features-overview)](#features-overview)

# 

# 

# 1. Introduction {#introduction}

**Key Capabilities:**

| **Stakeholder** | **Core Capabilities**                                                                                                                                                                                              |
|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Patient         | Register, search doctors by city/specialization/ratings, book appointments with specific time slots, upload medical documents, view prescriptions, provide feedback with ratings, receive real-time notifications. |
| Doctor          | Manage profile, set availability date ranges, manage time slots, approve/reject/confirm appointments, prescribe medicines, view patient visit history, send email to patients                                      |
| Admin           | Manage all doctors and patients (CRUD), monitor all appointments, view system-wide statistics via dashboard with charts, filter users by city, view documents                                                      |

# 2. Objectives {#objectives}

The main objectives of the project are:

1.  **Simplify Appointment Booking**: Provide patients with an intuitive interface to search for doctors by city and specialization, view available time slots on specific dates, and book appointments with a single click.

2.  **Organized Schedule Management for Doctors**: Allow doctors to define their availability by specifying date ranges (fromDate to endDate). The system automatically generates time slots within those ranges. Doctors can approve, reject, confirm, or cancel appointments from a centralized dashboard.

3.  **Centralized Administration**: Provide administrators with a comprehensive dashboard showing total doctors, total patients, total appointments, pending appointment counts, appointment-status distribution charts (using Recharts bar charts), recent appointments, and city-filtered lists of patients and doctors. Able to add/view/modify patients and doctors.

4.  **Digitize Medical Records:** Enable patients to upload medical documents (PDFs, images, reports) associated with their profile or a specific appointment. Doctors can also upload documents. All files are stored on the server\'s local file system under ./uploads/documents/.

5.  **Secure Authentication Using JWT:** Implement stateless authentication using JSON Web Tokens. The JWT payload contains userId, userName, role, and profileId. Tokens are configured with a 24-hour expiration (86400000 ms). Passwords are hashed using BCrypt before storage.

6.  **Role-Based Access Control (RBAC):** Enforce fine-grained access control at the API level using Spring Security\'s HttpSecurity configuration. Each endpoint is restricted based on role (ROLE_PATIENT, ROLE_DOCTOR, ROLE_ADMIN). For example, only patients can book appointments, only doctors/admins can approve/reject, and only admins can delete appointments.

7.  **Password Recovery via Email:** Implement a secure password reset workflow using time-limited tokens sent via SMTP email (Gmail). The PasswordResetToken entity tracks the token string, associated user, expiry datetime, and whether the token has been used.

8.  **Prescription Management:** Allow doctors to add prescribed medicines for each appointment, including medicine name, dosage, frequency, duration, and notes. Patients can view their prescription history through the visit history feature.

9.  **Real-Time In-App Notifications:** Implement a notification system that automatically alerts users about key events --- doctors receive notifications for new appointment requests, cancellations, and feedback; patients receive notifications for appointment approvals, rejections, confirmations, and cancellations. Notifications are polled every 30 seconds and displayed via a bell icon badge in the top navbar.

# 3. System Architecture {#system-architecture}

The system follows a **client-server monolithic architecture** with a clear separation between the frontend presentation layer and the backend application/data layer.

### **Architecture Flow**

![](media/image1.png){width="4.8441087051618545in" height="5.123577209098863in"}

# 4. Technology Stack {#technology-stack}

### Frontend:

| **Technology**   | **Version** | **Purpose**                                                                                               |
|------------------|-------------|-----------------------------------------------------------------------------------------------------------|
| React.js         | 19.2.4      | Component-based UI library for building the single-page application                                       |
| Vite             | Latest      | Fast build tool and development server with Hot Module Replacement (HMR)                                  |
| React Router DOM | 7.14.0      | Client-side routing with nested routes, protected routes, and role-based navigation                       |
| Axios            | 1.14.0      | HTTP client for making REST API calls with request/response interceptors                                  |
| Bootstrap        | 5.3.8       | CSS framework for responsive layout, cards, modals, forms, and grid system                                |
| React Bootstrap  | 2.10.10     | React component wrappers for Bootstrap UI elements                                                        |
| Bootstrap Icons  | 1.13.1      | Icon library used throughout the UI (e.g., bi-heart-pulse, bi-people, bi-calendar-check)                  |
| Recharts         | 3.8.1       | Charting library for data visualization (BarChart on Admin Dashboard for appointment status distribution) |
| date-fns         | 4.1.0       | Lightweight date formatting library (e.g., format(date, \'MMM dd, yyyy\'))                                |
| react-hot-toast  | 2.6.0       | Toast notification library for success/error messages                                                     |
| react-icons      | 5.6.0       | Additional icon support                                                                                   |

### Backend:

| **Technology**                 | **Version**      | **Purpose**                                                                                               |
|--------------------------------|------------------|-----------------------------------------------------------------------------------------------------------|
| Spring Boot                    | 3.2.0            | Application framework providing auto-configuration, embedded Tomcat, and dependency management            |
| Java                           | 17               | Programming language (LTS version)                                                                        |
| Spring Data JPA                | (via Boot 3.2)   | Object-relational mapping abstraction over Hibernate for database operations                              |
| Hibernate                      | (via Boot 3.2)   | JPA implementation handling SQL generation, connection pooling, and caching                               |
| Spring Security                | (via Boot 3.2)   | Authentication and authorization framework configured for stateless JWT-based security                    |
| Spring Boot Starter Validation | (via Boot 3.2)   | Bean validation using Jakarta Validation annotations (@NotBlank, @Email, @Pattern, @Min, @Max, @Positive) |
| Spring Boot Starter Mail       | (via Boot 3.2)   | SMTP email sending capability for password reset and doctor-to-patient communication                      |
| JJWT (io.jsonwebtoken)         | 0.11.5           | JSON Web Token creation, signing (HMAC-SHA256), and parsing                                               |
| Lombok                         | Latest           | Reduces boilerplate code with annotations (@Data, @NoArgsConstructor, @AllArgsConstructor)                |
| SpringDoc OpenAPI              | 2.3.0            | Auto-generates Swagger UI and OpenAPI 3.0 documentation at /swagger-ui.html                               |
| MySQL Connector/J              | Latest (runtime) | JDBC driver for MySQL database connectivity                                                               |

### Database:

| **Property**    | **Value**                                                              |
|-----------------|------------------------------------------------------------------------|
| Database Engine | MySQL                                                                  |
| Schema Name     | doctor_app (auto-created via createDatabaseIfNotExist=true)            |
| DDL Strategy    | update (Hibernate auto-creates/updates tables based on entity changes) |
| Connection      | jdbc:mysql://localhost:3306/doctor_app                                 |
| Server Port     | 8080                                                                   |

# 5. Modules Description {#modules-description}

### 5.1 User Entity {#user-entity}

| **Field** | **Type**             | **Constraints**                                 | **Description**                 |
|-----------|----------------------|-------------------------------------------------|---------------------------------|
| userId    | int (auto-increment) | Primary Key                                     | Unique identifier               |
| userName  | String               | @NotBlank, @Pattern(\^\[a-zA-Z0-9\]+\$), unique | Alphanumeric username for login |
| password  | String               | @NotBlank                                       | BCrypt-hashed password          |
| role      | String               | @NotBlank                                       | One of: PATIENT, DOCTOR, ADMIN  |

Relationships:

One-to-One with Patient, Doctor, and Admin (mapped by the child entities via user_id foreign key).

### 5.1.2 API endpoints {#api-endpoints}

| **Method** | **Endpoint**      | **Access**    | **Description**                                                                                                                                                                                             |
|------------|-------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| POST       | /login            | Public        | Authenticate user by username or mobile number. Returns JWT token with userId, userName, role, profileId, profileName. Supports auto-linking of doctor/patient profiles if they were created independently. |
| POST       | /register/patient | Public        | Register a new patient. Accepts PatientRegistrationDTO with password validation (8-20 chars, uppercase, lowercase, digit, special character). Creates both User and Patient records. Returns JWT token.     |
| POST       | /register/doctor  | Public        | Register a new doctor. Accepts DoctorRegistrationDTO. Creates both User and Doctor records. Returns JWT token.                                                                                              |
| POST       | /register/admin   | Public        | Register a new admin. Accepts AdminRegistrationDTO. Creates both User and Admin records. Returns JWT token.                                                                                                 |
| PUT        | /update           | Authenticated | Update user details                                                                                                                                                                                         |
| DELETE     | /remove           | Authenticated | Remove a user                                                                                                                                                                                               |
| POST       | /forgot-password  | Public        | Sends a password reset email with a unique token to the registered email address                                                                                                                            |
| POST       | /reset-password   | Public        | Resets the password using the token, new password, and confirmation password                                                                                                                                |

### 5.1.3 Password Policy: {#password-policy}

**Enforced via DTO validation:**

- Minimum 8 characters, maximum 20 characters

- At least one uppercase letter

- At least one lowercase letter

- At least one digit

- At least one special character from @\$!%\*?&#

- Regex: \^(?=.\*\[a-z\])(?=.\*\[A-Z\])(?=.\*\d)(?=.\*\[@\$!%\*?&#\])\[A-Za-z\d@\$!%\*?&#\]{8,20}\$

### 5.1.4 Password Reset Flow: {#password-reset-flow}

1.  Patient/Doctor submits email to POST /api/users/forgot-password

2.  Backend generates a unique PasswordResetToken(entity) with an expiry datetime, associates it with the user, and stores it in the password_reset_tokens table

3.  An email is sent via Gmail SMTP to the user containing a reset link: http://localhost:3000/reset-password?token=\<token\>

4.  User clicks the link, enters new password and confirmation

5.  Frontend sends POST /api/users/reset-password with token, newPassword, confirmPassword

6.  Backend validates the token (exists, not expired, not used), updates the user\'s password (BCrypt-hashed), and marks the token as used

### 5.2 Patient Entity {#patient-entity}

Base URL : api/patients

| **Field**    | **Type**             | **Constraints** | **Description**                                                    |
|--------------|----------------------|-----------------|--------------------------------------------------------------------|
| patientId    | int (auto-increment) | Primary Key     | Unique identifier                                                  |
| patientName  | String               | @NotBlank       | Full name of the patient                                           |
| mobileNo     | String               | Optional        | Contact phone number                                               |
| email        | String               | @Email, unique  | Email address                                                      |
| password     | String               | @NotBlank       | BCrypt-hashed password                                             |
| bloodGroup   | String               | Optional        | Blood group(e.g., A+,O-)                                           |
| gender       | String               | Optional        | Gender                                                             |
| age          | int                  | @Positive       | Age in years                                                       |
| address      | String               | Optional        | Residential address                                                |
| city         | String               | Optional        | City for location-based filtering                                  |
| profilePhoto | String (LONGTEXT)    | Optional        | Base64-encoded profile photo (stored as data:\<mime\>;base64,\...) |

Relationships:

- One-to-One with User (patient owns FK user_id)

- One-to-Many with Appointment

- One-to-Many with Feedback

| **Method** | **Endpoint**                    | **Access**     | **Description**                                                                                                                                                          |
|------------|---------------------------------|----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| POST       | /register                       | Admin          | Register a patient directly (admin-created)                                                                                                                              |
| PUT        | /update                         | Patient, Admin | Update patient details                                                                                                                                                   |
| DELETE     | /remove                         | Admin          | Remove a patient                                                                                                                                                         |
| GET        | /{patientId}                    | Authenticated  | Get patient by ID                                                                                                                                                        |
| GET        | /patients                       | Authenticated  | Get all patients                                                                                                                                                         |
| GET        | /by-doctor/{doctorId}           | Doctor, Admin  | Get patients who have appointments with a specific doctor                                                                                                                |
| GET        | /by-date/{date}                 | Authenticated  | Get patients who have appointments on a specific date                                                                                                                    |
| GET        | /{patientId}/history?doctorId=X | Authenticated  | Get complete visit history between a patient and doctor including appointment dates, statuses, time slots, remarks, and prescribed medicines (returns PatientHistoryDTO) |
| POST       | /{patientId}/photo              | Patient, Admin | Upload profile photo (multipart file, converted to Base64 and stored in the profilePhoto column)                                                                         |

Api.js (Frontend) ( src-\>services-\>api.js)

![](media/image2.png){width="6.5in" height="1.4013888888888888in"}

### 

#### 5.2.1 Patient History (Visit Detail) {#patient-history-visit-detail}

The PatientHistoryDTO provides a comprehensive view:

![](media/image3.png){width="4.982773403324584in" height="2.0692355643044618in"}

### **5.3 Doctor Module** (url : /api/doctors) {#doctor-module-url-apidoctors}

#### 5.3.1 Doctor Entity {#doctor-entity}

| **Field**       | **Type**                 | **Constraints** | **Description**                                        |
|-----------------|--------------------------|-----------------|--------------------------------------------------------|
| doctorId        | Integer (auto-increment) | Primary Key     | Unique identifier                                      |
| doctorName      | String                   | @NotBlank       | Full name                                              |
| speciality      | String                   | @NotBlank       | Medical specialization (e.g., Cardiology, Dermatology) |
| location        | String                   | Optional        | Clinic/hospital location                               |
| city            | String                   | Optional        | City for search filtering                              |
| hospitalName    | String                   | Optional        | Associated hospital                                    |
| mobileNo        | String                   | Optional        | Contact phone number                                   |
| email           | String                   | @Email, unique  | Email address                                          |
| password        | String                   | @NotBlank       | BCrypt-hashed password                                 |
| chargedPerVisit | double                   | @Positive       | Consultation fee (displayed as ₹ in the UI)            |
| profilePhoto    | String (LONGTEXT)        | Optional        | Base64-encoded profile photo                           |

Relationships:

- One-to-One with User (doctor owns FK user_id)

- One-to-Many with Appointment

- One-to-Many with Feedback

- One-to-Many with AvailabilityDates

#### 5.3.2 API Endpoints {#api-endpoints-1}

| **Method** | **Endpoint**                          | **Access**    | **Description**                                                                            |
|------------|---------------------------------------|---------------|--------------------------------------------------------------------------------------------|
| POST       | /add                                  | Admin         | Add a new doctor                                                                           |
| PUT        | /update                               | Doctor, Admin | Update doctor profile                                                                      |
| DELETE     | /remove                               | Admin         | Remove a doctor                                                                            |
| GET        | /{doctorId}                           | Authenticated | Get doctor by ID                                                                           |
| GET        | /                                     | Authenticated | Get all doctors                                                                            |
| GET        | /speciality/{speciality}              | Authenticated | Get doctors by specialization                                                              |
| GET        | /search?city=X&speciality=Y           | Authenticated | Search doctors by city and/or specialization (supports both, either, or neither parameter) |
| GET        | /availability/{doctorId}              | Authenticated | Get all availability date ranges for doctor                                                |
| POST       | /availability/add                     | Doctor, Admin | Add an availability date range                                                             |
| PUT        | /availability/update                  | Doctor, Admin | Update an availability date range                                                          |
| DELETE     | /availability/{availabilityId}        | Doctor, Admin | Delete an availability date range                                                          |
| GET        | /{doctorId}/slots?date=YYYY-MM-DD     | Authenticated | Get available (unbooked) time slots for a doctor on a specific date                        |
| GET        | /{doctorId}/slots/all?date=YYYY-MM-DD | Authenticated | Get all time slots (booked and unbooked) for a doctor on a date                            |
| POST       | /send-email                           | Doctor        | Send email to a patient (accepts to, subject, body in request body)                        |
| POST       | /{doctorId}/photo                     | Doctor, Admin | Upload profile photo                                                                       |

### **5.4 Appointment Module** (url : /api/appointments) {#appointment-module-url-apiappointments}

#### 5.4.1 Appointment entity: {#appointment-entity}

| **Field**         | **Type**             | **Constraints**         | **Description**                                           |
|-------------------|----------------------|-------------------------|-----------------------------------------------------------|
| appointmentId     | int (auto-increment) | Primary Key             | Unique identifier                                         |
| patient           | Patient (ManyToOne)  | @NotNull, FK patient_id | The patient who booked                                    |
| doctor            | Doctor (ManyToOne)   | @NotNull, FK doctor_id  | The assigned doctor                                       |
| appointmentDate   | LocalDate            | Not null                | Date of the appointment                                   |
| appointmentStatus | String               | Optional                | Status: PENDING, APPROVED, CONFIRMED, REJECTED, CANCELLED |
| remark            | String               | Optional                | Doctor\'s remark or notes                                 |
| timeSlot          | TimeSlot (ManyToOne) | FK time_slot_id         | The specific time slot allocated                          |

#### 5.4.2. Appointment Status Lifecycle: {#appointment-status-lifecycle}

![](media/image4.png){width="4.416049868766404in" height="1.2998097112860891in"}

| **Transition** | **Who Can Perform**    |
|----------------|------------------------|
| → APPROVED     | Doctor, Admin          |
| → REJECTED     | Doctor, Admin          |
| → CONFIRMED    | Doctor, Admin          |
| → CANCELLED    | Doctor, Admin, Patient |
| Hard Delete    | Admin only             |

| **Method** | **Endpoint**             | **Access**             | **Description**                                                                                                                      |
|------------|--------------------------|------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| GET        | /                        | Authenticated          | Get all appointments                                                                                                                 |
| GET        | /{appointmentId}         | Authenticated          | Get appointment by ID                                                                                                                |
| POST       | /book                    | Patient                | Book a new appointment (accepts AppointmentDTO with patientId, doctorId, appointmentDate, timeSlotId; validates doctor availability) |
| DELETE     | /{appointmentId}         | Admin                  | Hard-delete an appointment                                                                                                           |
| PUT        | /{appointmentId}/approve | Doctor, Admin          | Approve a pending appointment                                                                                                        |
| PUT        | /{appointmentId}/reject  | Doctor, Admin          | Reject an appointment                                                                                                                |
| PUT        | /{appointmentId}/confirm | Doctor, Admin          | Confirm an approved appointment                                                                                                      |
| PUT        | /{appointmentId}/cancel  | Doctor, Admin, Patient | Cancel an appointment                                                                                                                |
| GET        | /by-doctor/{doctorId}    | Doctor, Admin          | Get all appointments for a doctor                                                                                                    |
| GET        | /by-patient/{patientId}  | Patient                | Get all appointments for a patient                                                                                                   |
| GET        | /by-date/{date}          | Authenticated          | Get all appointments on a specific date                                                                                              |

#### 5.4.4 Booking DTO (AppointmentDTO) {#booking-dto-appointmentdto}

| **Field**         | **Type**  | **Validation** | **Description**                      |
|-------------------|-----------|----------------|--------------------------------------|
| patientId         | Integer   | @NotNull       | Patient booking the appointment      |
| doctorId          | Integer   | @NotNull       | Target doctor                        |
| appointmentDate   | LocalDate | @NotNull       | Desired date                         |
| appointmentStatus | String    | Optional       | Initial status (defaults to PENDING) |
| remark            | String    | Optional       | Patient\'s remark                    |
| timeSlotId        | Integer   | Optional       | Selected time slot                   |

### 5.5 Time Slot & Availability Module {#time-slot-availability-module}

#### 5.5.1 Entity: TimeSlot {#entity-timeslot}

| **Field**  | **Type**             | **Constraints**         | **Description**                       |
|------------|----------------------|-------------------------|---------------------------------------|
| timeSlotId | int (auto-increment) | Primary Key             | Unique identifier                     |
| doctor     | Doctor (ManyToOne)   | FK doctor_id, not null  | The doctor this slot belongs to       |
| date       | LocalDate            | Not null                | The date of this slot                 |
| startTime  | LocalTime            | Not null                | Slot start time (e.g., 10:00)         |
| endTime    | LocalTime            | Not null                | Slot end time (e.g., 10:30)           |
| isBooked   | boolean              | Not null, default false | Whether this slot is already reserved |

#### 5.5.2 Entity: AvailabilityDates {#entity-availabilitydates}

| **Field**      | **Type**             | **Constraints**        | **Description**             |
|----------------|----------------------|------------------------|-----------------------------|
| availabilityId | int (auto-increment) | Primary Key            | Unique identifier           |
| doctor         | Doctor (ManyToOne)   | @NotNull, FK doctor_id | Associated doctor           |
| fromDate       | LocalDate            | Not null               | Start of availability range |
| endDate        | LocalDate            | Not null               | End of availability range   |

Doctors define broad availability ranges, and the system generates individual time slots within those ranges for patients to book.

### 5.6 Admin Module {#admin-module}

#### 5.6.1 Entity: Admin {#entity-admin}

| **Field**     | **Type**             | **Constraints** | **Description**        |
|---------------|----------------------|-----------------|------------------------|
| adminId       | int (auto-increment) | Primary Key     | Unique identifier      |
| adminName     | String               | @NotBlank       | Admin\'s name          |
| contactNumber | String               | Optional        | Contact phone          |
| email         | String               | @Email, unique  | Email address          |
| password      | String               | @NotBlank       | BCrypt-hashed password |

Relationship: One-to-One with User (admin owns FK user_id)

#### 5.6.2 API Endpoints {#api-endpoints-2}

| **Method** | **Endpoint** | **Access** | **Description**           |
|------------|--------------|------------|---------------------------|
| POST       | /add         | Admin      | Add a new admin           |
| PUT        | /update      | Admin      | Update admin details      |
| DELETE     | /remove      | Admin      | Remove an admin           |
| GET        | /view        | Admin      | Get admin by request body |
| GET        | /{adminId}   | Admin      | Get admin by ID           |

#### 5.6.3 Admin Dashboard Features (Frontend) {#admin-dashboard-features-frontend}

The AdminDashboard.jsx component provides:

- **Stat Cards**: Total Doctors, Total Patients, Total Appointments, Pending Appointments (each with color-coded icons)

- **Appointments by Status Bar Chart**: A Recharts BarChart showing counts for PENDING, APPROVED, CONFIRMED, REJECTED, CANCELLED

- **Recent Appointments List**: Last 5 appointments sorted by date (showing patient → doctor, date, and status badge)

- **People by Location:** City-filtered dropdown showing patients and doctors in a dual-column layout. Displays profile photos, names, emails, cities, specializations, ages, and consultation fees.

- **Admin Add User(Doctor and Patients)** -- Admin can directly add user(patient/doctor)by filling out respective details.

- **Admin Document Viewing**: Admins can view and download documents for both patients and doctors directly from their respective management pages via a \"Docs\" icon button and Documents Modal.

### **5.7 Document Module** (url : /api/documents) {#document-module-url-apidocuments}

#### 5.7.1 Medical Document entity {#medical-document-entity}

| Field          | Type                    | Constraints       | Description                                   |
|----------------|-------------------------|-------------------|-----------------------------------------------|
| documentId     | int (auto-increment)    | Primary Key       | Unique identifier                             |
| patient        | Patient (ManyToOne)     | FK patient_id     | Associated patient (nullable)                 |
| doctor         | Doctor (ManyToOne)      | FK doctor_id      | Associated doctor (nullable)                  |
| appointment    | Appointment (ManyToOne) | FK appointment_id | Associated appointment (nullable)             |
| fileName       | String                  | Not null          | Original file name (as uploaded)              |
| storedFileName | String                  | Not null          | System-generated unique filename on disk      |
| fileType       | String                  | Optional          | MIME type (e.g., application/pdf, image/jpeg) |
| uploadDate     | LocalDateTime           | Not null          | Timestamp of upload                           |
| description    | String                  | Optional          | User-provided description                     |

**File Storage**: Files are stored on the local file system at ./uploads/documents/.

The FileStorageService(serviceInterface) handles storing with unique names, loading as Resource, and deletion.

Upload Limits: Maximum file size is 10 MB per file and 10 MB per request.

#### 5.7.2 API Endpoints {#api-endpoints-3}

| **Method** | **Endpoint**                 | **Access**             | **Description**                                                                                   |
|------------|------------------------------|------------------------|---------------------------------------------------------------------------------------------------|
| POST       | /upload                      | Patient                | Upload a document for a patient (multipart: file, patientId, optional appointmentId, description) |
| POST       | /doctor/upload               | Doctor                 | Upload a document for a doctor (multipart: file, doctorId, optional description)                  |
| GET        | /patient/{patientId}         | Authenticated          | Get all documents for a patient                                                                   |
| GET        | /doctor/{doctorId}           | Doctor, Admin          | Get all documents for a doctor                                                                    |
| GET        | /appointment/{appointmentId} | Authenticated          | Get all documents for an appointment                                                              |
| GET        | /{documentId}/download       | Authenticated          | Download a document                                                                               |
| DELETE     | /{documentId}                | Patient, Doctor, Admin | Delete a document (removes from both DB and file system)                                          |

### 5.8 Feedback Module {#feedback-module}

#### 5.8.1 Feedback Entity {#feedback-entity}

| **Field**       | **Type**               | **Constraints**              | **Description**                          |
|-----------------|------------------------|------------------------------|------------------------------------------|
| feedbackId      | int (auto-increment)   | Primary Key                  | Unique identifier                        |
| rating          | int                    | @Min(1), @Max(5)             | Rating from 1 to 5 stars                 |
| patient         | Patient (ManyToOne)    | @NotNull, FK patient_id      | Patient who gave feedback                |
| doctor          | Doctor (ManyToOne)     | @NotNull, FK doctor_id       | Doctor being rated                       |
| feedbackComment | String                 | Optional                     | Free-text comment                        |
| appointment     | Appointment(ManyToOne) | FK appointment_id (nullable) | Links feedback to a specific appointment |

#### 5.8.2 API Endpoints {#api-endpoints-4}

| **Method** | **Endpoint**          |                                 | **Access**    | **Description**                                                                                                                      |
|------------|-----------------------|---------------------------------|---------------|--------------------------------------------------------------------------------------------------------------------------------------|
| POST       | /add                  |                                 | Patient       | Submit feedback for a doctor                                                                                                         |
| GET        | /{feedbackId}         |                                 | Authenticated | Get feedback by ID                                                                                                                   |
| GET        | /by-doctor/{doctorId} |                                 | Authenticated | Get all feedbacks for a doctor                                                                                                       |
| POST       |                       | /add                            | Patient       | Submit feedback for a doctor linked to a specific appointment. Returns 409 Conflict if feedback already exists for that appointment. |
| GET        |                       | /by-appointment/{appointmentId} | Authenticated | Get feedback for a specific appointment (returns null data if none exists)                                                           |

### 5.9 Medicine/Prescription Module (url: /api/medicines) {#medicineprescription-module-url-apimedicines}

#### 5.9.1 Entity: Medicine {#entity-medicine}

| **Field**    | **Type**                | **Constraints**             | **Description**                   |
|--------------|-------------------------|-----------------------------|-----------------------------------|
| medicineId   | int (auto-increment)    | Primary Key                 | Unique identifier                 |
| appointment  | Appointment (ManyToOne) | FK appointment_id, not null | Linked appointment                |
| medicineName | String                  | @NotBlank                   | Name of the medicine              |
| dosage       | String                  | Optional                    | Dosage (e.g., \"500mg\")          |
| frequency    | String                  | Optional                    | How often (e.g., \"Twice daily\") |
| duration     | String                  | Optional                    | Duration (e.g., \"7 days\")       |
| notes        | String                  | Optional                    | Additional instructions           |

#### 5.9.2 API Endpoints {#api-endpoints-5}

| **Method** | **Endpoint**                 | **Access**    | **Description**                                           |
|------------|------------------------------|---------------|-----------------------------------------------------------|
| POST       | /appointment/{appointmentId} | Doctor, Admin | Add a list of medicines for an appointment (batch create) |
| GET        | /appointment/{appointmentId} | Authenticated | Get all medicines for an appointment                      |
| PUT        | /{medicineId}                | Doctor, Admin | Update a specific medicine                                |
| DELETE     | /{medicineId}                | Doctor, Admin | Delete a specific medicine                                |

### 5.10 Notification Module {#notification-module}

#### 5.10.1 Notification entity {#notification-entity}

| Field       | Type                  | Constraints                    | Description                                                                                                                                             |
|-------------|-----------------------|--------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| id          | Long (auto-increment) | Primary Key                    | Unique identifier                                                                                                                                       |
| recipient   | User (ManyToOne)      | @NotNull, FK recipient_user_id | The user receiving the notification                                                                                                                     |
| title       | String                | @NotNull                       | Notification title (e.g., \"New Appointment Request\")                                                                                                  |
| message     | String                | @NotNull, max 500 chars        | Notification body text                                                                                                                                  |
| type        | String                | @NotNull                       | Notification type enum: APPOINTMENT_BOOKED, APPOINTMENT_APPROVED, APPOINTMENT_REJECTED, APPOINTMENT_CONFIRMED, APPOINTMENT_CANCELLED, FEEDBACK_RECEIVED |
| isRead      | boolean               | @NotNull, default false        | Whether the notification has been read                                                                                                                  |
| createdAt   | LocalDateTime         | @NotNull, default now()        | Timestamp of creation                                                                                                                                   |
| referenceId | Long                  | Optional                       | ID of the related entity (appointmentId or feedbackId)                                                                                                  |

#### 5.10.2 API Endpoints (url: /api/notifications) {#api-endpoints-url-apinotifications}

| Method | Endpoint               | Access        | Description                                                                   |
|--------|------------------------|---------------|-------------------------------------------------------------------------------|
| GET    | /{userId}              | Authenticated | Get all notifications for a user (ordered by createdAt descending)            |
| GET    | /{userId}/unread-count | Authenticated | Get count of unread notifications                                             |
| PUT    | /{id}/read             | Authenticated | Mark a single notification as read                                            |
| PUT    | /{userId}/read-all     | Authenticated | Mark all notifications as read for a user (uses @Modifying JPQL update query) |
| DELETE | /{id}                  | Authenticated | Delete a notification                                                         |

#### 5.10.3 Notification Triggers (Backend) {#notification-triggers-backend}

Notifications are created automatically in the service layer (not controllers):

| **Event**                   | **Recipient** | **Type**              | **Triggered In**                            |
|-----------------------------|---------------|-----------------------|---------------------------------------------|
| Patient books appointment   | Doctor        | APPOINTMENT_BOOKED    | AppointmentServiceImpl.bookAppointment()    |
| Doctor approves appointment | Patient       | APPOINTMENT_APPROVED  | AppointmentServiceImpl.approveAppointment() |
| Doctor rejects appointment  | Patient       | APPOINTMENT_REJECTED  | AppointmentServiceImpl.rejectAppointment()  |
| Doctor confirms appointment | Patient       | APPOINTMENT_CONFIRMED | AppointmentServiceImpl.confirmAppointment() |
| Patient cancels appointment | Doctor        | APPOINTMENT_CANCELLED | AppointmentServiceImpl.cancelAppointment()  |
| Patient submits feedback    | Doctor        | FEEDBACK_RECEIVED     | FeedbackServiceImpl.addFeedback()           |

#### 5.10.4 NotificationDTO {#notificationdto}

| **Field**   | **Type**      | **Description**            |
|-------------|---------------|----------------------------|
| id          | Long          | Notification ID            |
| title       | String        | Notification title         |
| message     | String        | Notification body          |
| type        | String        | Notification type constant |
| isRead      | boolean       | Read status                |
| createdAt   | LocalDateTime | Creation timestamp         |
| referenceId | Long          | Related entity ID          |

# 6. Database Design {#database-design}

### 6.1 Entity-Relationship Summary {#entity-relationship-summary}

The database doctor_app contains 11 tables with the following relationships:

![](media/image5.png){width="6.893844050743657in" height="4.289109798775153in"}

### 6.2 Table Definitions {#table-definitions}

| **Table Name**        | **Primary Key** | **Foreign Keys**                                                                                    | **Description**                                                 |
|-----------------------|-----------------|-----------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|
| users                 | userId          | ---                                                                                                 | Core identity table; stores username, BCrypt password, and role |
| patients              | patientId       | user_id → users.userId (unique)                                                                     | Patient personal info, profile photo (Base64)                   |
| doctors               | doctorId        | user_id → users.userId (unique)                                                                     | Doctor profile, speciality, hospital, consultation fee          |
| admins                | adminId         | user_id → users.userId (unique)                                                                     | Admin profile information                                       |
| appointments          | appointmentId   | patient_id → patients.patientId, doctor_id → doctors.doctorId, time_slot_id → time_slots.timeSlotId | Core scheduling table with date, status, and remark             |
| time_slots            | timeSlotId      | doctor_id → doctors.doctorId                                                                        | Individual 30-min (configurable) slots per doctor per date      |
| availability_dates    | availabilityId  | doctor_id → doctors.doctorId                                                                        | Date ranges when a doctor is available                          |
| feedbacks             | feedbackId      | patient_id → patients.patientId, doctor_id → doctors.doctorId                                       | Ratings (1-5) and comments                                      |
| medicines             | medicineId      | appointment_id → appointments.appointmentId                                                         | Prescriptions per appointment                                   |
| medical_documents     | documentId      | patient_id, doctor_id, appointment_id                                                               | Uploaded files metadata                                         |
| password_reset_tokens | id              | user_id → users.userId                                                                              | Time-limited tokens for password recovery                       |
| notifications         | id              | recipient_user_id → users.userId                                                                    | In-app notification storage with type, read status, timestamps  |

### 6.3 JPA Repositories {#jpa-repositories}

The project uses 11 Spring Data JPA repositories (in repository.jpa package):

| **Repository**                  | **Key Custom Methods**                                                                                                                                                                             |
|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| UserJpaRepository               | findByUserName(), existsByUserName()                                                                                                                                                               |
| PatientJpaRepository            | findByUser(), findByEmail()                                                                                                                                                                        |
| DoctorJpaRepository             | findByUser(), findByEmail(), findByCity(), findByCityAndSpeciality()                                                                                                                               |
| AdminJpaRepository              | findByUser()                                                                                                                                                                                       |
| AppointmentJpaRepository        | findByPatientAndDoctorOrderByAppointmentDateDesc()                                                                                                                                                 |
| TimeSlotJpaRepository           | findByDoctorAndDateAndIsBookedFalse(), findByDoctorAndDate()                                                                                                                                       |
| AvailabilityDatesJpaRepository  | findByDoctor()                                                                                                                                                                                     |
| FeedbackJpaRepository           | findByDoctor(Doctor doctor)                                                                                                                                                                        |
| MedicineJpaRepository           | findByAppointment()                                                                                                                                                                                |
| MedicalDocumentJpaRepository    | findByPatient(), findByDoctor(), findByAppointment()                                                                                                                                               |
| PasswordResetTokenJpaRepository | findByToken(String token)                                                                                                                                                                          |
| FeedbackJpaRepository           | findByDoctor(), findByAppointment_AppointmentId()                                                                                                                                                  |
| NotificationJpaRepository       | findByRecipientUserIdOrderByCreatedAtDesc(), findByRecipientUserIdAndIsReadFalseOrderByCreatedAtDesc(), countByRecipientUserIdAndIsReadFalse(), markAllAsReadByUserId() (custom @Modifying @Query) |

# 7. Authentication And Security {#authentication-and-security}

### 7.1 JWT Authentication {#jwt-authentication}

| **Aspect**             | **Detail**                                                                          |
|------------------------|-------------------------------------------------------------------------------------|
| Algorithm              | HMAC-SHA256 (HS256)                                                                 |
| Secret Key             | Configured via jwt.secret property (minimum 32 bytes)                               |
| Token Expiry           | 24 hours (86400000 milliseconds)                                                    |
| Token Payload (Claims) | sub (username), userId, role, profileId, iat (issued at), exp (expiration)          |
| Token Delivery         | Returned in LoginResponseDTO.token upon successful authentication                   |
| Token Storage (Client) | localStorage in the browser                                                         |
| Token Transmission     | Authorization: Bearer \<token\> header on every API request (via Axios interceptor) |

### 7.2 JWT Filter Chain {#jwt-filter-chain}

The JwtAuthenticationFilter extends OncePerRequestFilter and executes for every incoming request:

1.  Extracts the Authorization header

2.  Checks for Bearer prefix

3.  Calls JwtUtil.validateToken(token) to verify signature and expiration.

4.  Extracts userName and role from token claims

5.  Creates a UsernamePasswordAuthenticationToken with authority ROLE\_\<role\>

6.  Sets the authentication in SecurityContextHolder

7.  Calls filterChain.doFilter() to continue

### 7.3 Role-Based Access Control (RBAC) {#role-based-access-control-rbac}

Spring Security\'s SecurityFilterChain bean defines granular access rules:

**Public Endpoints (No Authentication Required)**

| **Method** | **Endpoint**                                                    | **Rule**    |
|------------|-----------------------------------------------------------------|-------------|
| ANY        | /api/users/login                                                | permitAll() |
| ANY        | /api/users/register/\*\*                                        | permitAll() |
| ANY        | /api/users/forgot-password                                      | permitAll() |
| ANY        | /api/users/reset-password                                       | permitAll() |
| ANY        | /swagger-ui/\*\*, /swagger-ui.html                              | permitAll() |
| ANY        | /v3/api-docs/\*\*, /api-docs/\*\*                               | permitAll() |
| GET        | /api/doctors, /api/doctors/search, /api/doctors/speciality/\*\* | permitAll() |
| GET        | /api/doctors/\*/public                                          | permitAll() |
| GET        | /api/feedbacks/by-doctor/\*\*                                   | permitAll() |

**Patient-Only Endpoints**

| **Method** | **Endpoint**                      | **Allowed Roles** |
|------------|-----------------------------------|-------------------|
| POST       | /api/appointments/book            | PATIENT           |
| GET        | /api/appointments/by-patient/\*\* | PATIENT           |
| POST       | /api/feedbacks/add                | PATIENT           |

**Document Endpoints**

| **Method** | **Endpoint**                 | **Allowed Roles**                  |
|------------|------------------------------|------------------------------------|
| POST       | /api/documents/upload        | PATIENT                            |
| POST       | /api/documents/doctor/upload | DOCTOR                             |
| GET        | /api/documents/doctor/\*\*   | DOCTOR, ADMIN                      |
| DELETE     | /api/documents/\*\*          | PATIENT, DOCTOR, ADMIN             |
| GET        | /api/documents/\*\*          | Authenticated (any logged-in user) |

**Medicine Endpoints**

| **Method** | **Endpoint**        | **Allowed Roles** |
|------------|---------------------|-------------------|
| POST       | /api/medicines/\*\* | DOCTOR, ADMIN     |
| PUT        | /api/medicines/\*\* | DOCTOR, ADMIN     |
| DELETE     | /api/medicines/\*\* | DOCTOR, ADMIN     |
| GET        | /api/medicines/\*\* | Authenticated     |

**Doctor-Specific Query Endpoints**

| **Method** | **Endpoint**                     | **Allowed Roles** |
|------------|----------------------------------|-------------------|
| GET        | /api/appointments/by-doctor/\*\* | DOCTOR, ADMIN     |
| GET        | /api/patients/by-doctor/\*\*     | DOCTOR, ADMIN     |

**Appointment Management Endpoints**

| **Method** | **Endpoint**                 | **Allowed Roles**      |
|------------|------------------------------|------------------------|
| PUT        | /api/appointments/\*/approve | DOCTOR, ADMIN          |
| PUT        | /api/appointments/\*/reject  | DOCTOR, ADMIN          |
| PUT        | /api/appointments/\*/confirm | DOCTOR, ADMIN          |
| PUT        | /api/appointments/\*/cancel  | PATIENT, DOCTOR, ADMIN |
| DELETE     | /api/appointments/\*\*       | ADMIN                  |

**Patient CRUD Endpoints**

| **Method** | **Endpoint**                          | **Allowed Roles** |
|------------|---------------------------------------|-------------------|
| POST       | /api/patients/\*/photo                | PATIENT, ADMIN    |
| POST       | /api/patients/\*\* (other than photo) | ADMIN             |
| PUT        | /api/patients/update                  | PATIENT, ADMIN    |
| DELETE     | /api/patients/\*\*                    | ADMIN             |

**Doctor CRUD & Availability Endpoints**

| **Method** | **Endpoint**                   | **Allowed Roles** |
|------------|--------------------------------|-------------------|
| POST       | /api/doctors/\*/photo          | DOCTOR, ADMIN     |
| POST       | /api/doctors/add               | ADMIN             |
| PUT        | /api/doctors/update            | DOCTOR, ADMIN     |
| DELETE     | /api/doctors/remove            | ADMIN             |
| POST       | /api/doctors/availability/\*\* | DOCTOR, ADMIN     |
| PUT        | /api/doctors/availability/\*\* | DOCTOR, ADMIN     |
| DELETE     | /api/doctors/availability/\*\* | DOCTOR, ADMIN     |

**Doctor Email Endpoint**

| **Method** | **Endpoint**            | **Allowed Roles** |
|------------|-------------------------|-------------------|
| POST       | /api/doctors/send-email | DOCTOR            |

**Admin CRUD Endpoints**

| **Method** | **Endpoint**     | **Allowed Roles** |
|------------|------------------|-------------------|
| ANY        | /api/admins/\*\* | ADMIN             |

**Read-Only Endpoints (Any Authenticated User)**

| **Method** | **Endpoint**           | **Allowed Roles** |
|------------|------------------------|-------------------|
| GET        | /api/doctors/\*\*      | Authenticated     |
| GET        | /api/patients/\*\*     | Authenticated     |
| GET        | /api/appointments/\*\* | Authenticated     |
| GET        | /api/feedbacks/\*\*    | Authenticated     |

Notification Endpoints

| Method | Endpoint                | Allowed Roles                      |
|--------|-------------------------|------------------------------------|
| ANY    | /api/notifications/\*\* | Authenticated (any logged-in user) |

### 7.4 Password Security {#password-security}

- **Hashing**: BCrypt via Spring Security\'s BCryptPasswordEncoder

- **Validation:** Passwords are validated against a regex pattern in the registration DTOs before hashing

- **Storage:** Only the BCrypt hash is stored in both users.password and the respective profile table\'s password field

### 7.5 Session Management {#session-management}

The application is fully stateless --- configured with SessionCreationPolicy.STATELESS. No server-side sessions are created; all authentication state is carried in the JWT.

### 7.6 CSRF Protection {#csrf-protection}

CSRF is disabled (csrf.disable()) since the API is stateless and uses JWT Bearer tokens (not cookies), making CSRF attacks inapplicable.

# 

# 8. User Workflows {#user-workflows}

### 8.1 Patient Workflow  {#patient-workflow}

![](media/image6.png){width="6.5in" height="3.545138888888889in"}

### 8.2 Doctor Workflow {#doctor-workflow}

![](media/image7.png){width="6.5in" height="3.545138888888889in"}

### 8.3 Admin Workflow {#admin-workflow}

![](media/image8.png){width="6.5in" height="3.545138888888889in"}

# 

# 9. Exception Handling {#exception-handling}

### 9.1 Global Exception Handler {#global-exception-handler}

The GlobalExceptionHandler class (@RestControllerAdvice) provides centralized error handling:

| **Exception**                   | **HTTP Status**   | **Response Structure**                                                                    |
|---------------------------------|-------------------|-------------------------------------------------------------------------------------------|
| ResourceNotFoundException       | 404 Not Found     | { timestamp, status: 404, error: \"Not Found\", message }                                 |
| DuplicateResourceException      | 409 Conflict      | { timestamp, status: 409, error: \"Conflict\", message }                                  |
| MethodArgumentNotValidException | 400 Bad Request   | { timestamp, status: 400, error: \"Validation Failed\", fieldErrors: { field: message } } |
| InvalidCredentialsException     | (Custom handling) | Used for login failures                                                                   |

### 9.2 Custom Exceptions {#custom-exceptions}

| **Exception Class**         | **Purpose**                                                                        |
|-----------------------------|------------------------------------------------------------------------------------|
| ResourceNotFoundException   | Thrown when an entity is not found by ID                                           |
| DuplicateResourceException  | Thrown when a unique constraint would be violated (e.g., duplicate username/email) |
| InvalidCredentialsException | Thrown when login credentials are incorrect                                        |

# 10. Frontend Architecture  {#frontend-architecture}

### 10.1 Directory Structure: {#directory-structure}

![](media/image9.png){width="7.401186570428696in" height="3.5189873140857393in"}

# 11. Context Providers(Global State)  {#context-providersglobal-state}

### 11.1 AuthContext (context/AuthContext.jsx) {#authcontext-contextauthcontext.jsx}

Manages authentication state across the application.

| **Property/Method** | **Type**       | **Description**                                                         |
|---------------------|----------------|-------------------------------------------------------------------------|
| user                | Object \| null | Current user: { userId, userName, role, profileId, profileName, token } |
| loading             | boolean        | True while checking token on initial load                               |
| loginUser(response) | Function       | Stores token in localStorage, decodes JWT, sets user state              |
| logout()            | Function       | Clears localStorage, sets user to null                                  |

Token Handling:

- On app load, reads token from localStorage

- Decodes JWT payload using custom jwtDecode() (base64 → JSON, no external library)

- Checks exp claim against current time --- if expired, clears storage

- Extracts: userId, sub (username), role, profileId

### 11.2 NotificationContext (context/NotificationContext.jsx) {#notificationcontext-contextnotificationcontext.jsx}

Manages real-time notification state with polling.

| **Property/Method**    | **Type** | **Description**                                          |
|------------------------|----------|----------------------------------------------------------|
| notifications          | Array    | Full list of notifications for current user              |
| unreadCount            | number   | Count of unread notifications                            |
| refreshNotifications() | Function | Fetches both notifications and unread count              |
| markRead(id)           | Function | Marks single notification as read (optimistic UI update) |
| markAllRead()          | Function | Marks all as read for current user                       |

### 11.3 Custom JWT Decoder (context/jwtDecode.js) {#custom-jwt-decoder-contextjwtdecode.js}

A lightweight custom implementation that decodes JWT without any library dependency:

1.  Splits token by ., takes the payload (index 1)

2.  Replaces URL-safe Base64 characters (- → +, \_ → /)

3.  Decodes via atob() → decodeURIComponent → JSON.parse

4.  Returns the claims object or empty object on failure

# 12. Reusable Components  {#reusable-components}

### **12.1 ProtectedRoute** (components/ProtectedRoute.jsx) {#protectedroute-componentsprotectedroute.jsx}

Route guard component that wraps role-restricted routes.

| **Prop** | **Type**   | **Description**                                                      |
|----------|------------|----------------------------------------------------------------------|
| children | ReactNode  | The protected child component                                        |
| roles    | string\[\] | Allowed roles (e.g., \[\'PATIENT\'\], \[\'DOCTOR\'\], \[\'ADMIN\'\]) |

Behavior:

- While loading is true → Shows a centered Bootstrap Spinner

- If no user → Redirects to /login

- If user\'s role not in roles array → Redirects to /unauthorized

- Otherwise → Renders children

### **12.2 Dashboard Layout** (components/DashboardLayout.jsx) {#dashboard-layout-componentsdashboardlayout.jsx}

Shell component for all authenticated dashboard pages. Renders:

- **Sidebar** (left, fixed position, collapsible --- 260px expanded / 70px collapsed)

- **TopNavbar** (top, fixed position, adjusts left margin based on sidebar state)

- **\<Outlet /\>** (React Router nested route content area, with marginTop: 60px and padding: 1rem)

### **12.3 Sidebar** (components/Sidebar.jsx) {#sidebar-componentssidebar.jsx}

Role-aware navigation sidebar.

Navigation links by role:

| **Role** | **Links**                                                              |
|----------|------------------------------------------------------------------------|
| ADMIN    | Dashboard, Doctors, Patients, Appointments, Feedbacks                  |
| DOCTOR   | Dashboard, Appointments, My Patients, Availability, Feedbacks, Profile |
| PATIENT  | Dashboard, Find Doctors, My Appointments, Book Appointment, Profile    |

Features:

- Profile section: Shows profile photo (if available) or default avatar, user name, speciality/hospital for doctors

- Fetches profile data via getDoctorById or getPatientById on mount

- Collapsible: Toggle button switches between full (260px) and icon-only (70px) modes

- Active link highlighting: Uses NavLink with isActive for styling

- Logout button at bottom with red styling

- Brand logo links back to landing page (/)

### **12.4 TopNavbar** (Components/TopNavbar.jsx) {#topnavbar-componentstopnavbar.jsx}

Features:

- Welcome message: \"Welcome back, {profileName}\"

- Notification bell with unread count badge (red pill, max \"99+\")

- Notification dropdown (360px wide, max 420px height):

- Shows 5 most recent notifications

- Type-specific icons and colors per notification type

- \"Mark all read\" link

- Unread items highlighted with blue background

- Relative timestamps (e.g., \"2 hours ago\") via formatDistanceToNow

- Clicking a notification: marks as read, navigates to relevant page (appointments or feedbacks)

- \"View all notifications\" link → /{role}/notifications

- User dropdown (React Bootstrap Dropdown): Shows user initial in circle, name, role header, logout option

### 12.5 CitySelect (components/CitySelect.jsx) {#cityselect-componentscityselect.jsx}

Dropdown component with 55+ Indian cities (Agra to Warangal). Exports both the component and the indianCities array. Used in: Registration, Admin Add Doctor, BookAppointment, PatientProfile, DoctorProfile.

### **12.6 SpecializationSelect (**components/SpecializationSelect.jsx) {#specializationselect-componentsspecializationselect.jsx}

Dropdown component with 17 medical specializations (Physician, Cardiologist, Dermatologist, Dentist, ENT Specialist, Gastroenterologist, Gynecologist, Neurologist, Oncologist, Ophthalmologist, Orthopedic, Pediatrician, Psychiatrist, Pulmonologist, Radiologist, Surgeon, Urologist). Used in: Registration, Admin Add Doctor, BookAppointment.

### **12.7 StatusBadge (**components/StatusBadge.jsx) {#statusbadge-componentsstatusbadge.jsx}

Renders a Bootstrap badge with color-coded appointment status.

| **Status** | **Bootstrap Variant** |
|------------|-----------------------|
| PENDING    | warning (yellow)      |
| APPROVED   | info (cyan)           |
| CONFIRMED  | success (green)       |
| REJECTED   | danger (red)          |
| CANCELLED  | secondary (gray)      |

# 13. Routing Architecture  {#routing-architecture}

### 13.1 Provider Hierarchy {#provider-hierarchy}

\<AuthProvider\>

\<NotificationProvider\>

\<Router\>

\<Toaster /\>

\<Routes\>\...\</Routes\>

\</Router\>

\</NotificationProvider\>

\</AuthProvider\>

### 

### 

### 13.2 Route Map {#route-map}

**Public Routes (No Authentication):**

| **Path**         | **Component**  | **Description**                                                  |
|------------------|----------------|------------------------------------------------------------------|
| /                | LandingPage    | Hero page with specializations, testimonials, stats, footer      |
| /login           | Login          | Username or mobile-based login with country code support         |
| /register        | Register       | Dual-mode registration (Patient / Doctor) with validation        |
| /forgot-password | ForgotPassword | Email input for password reset                                   |
| /reset-password  | ResetPassword  | Token-based password reset (accessed via email link)             |
| /unauthorized    | Unauthorized   | 403 access denied page                                           |
| /doctors         | PublicDoctors  | Public doctor listing with search, specialization & city filters |
| /services        | Services       | Platform services overview (8 service cards)                     |
| /about           | About          | About the platform                                               |
| /contact         | Contact        | Contact form (name, email, subject, message)                     |
| /privacy-policy  | PrivacyPolicy  | Privacy policy                                                   |
| /terms           | TermsOfService | Terms of service                                                 |
| \*               | NotFound       | 404 catch-all                                                    |

**Patient Routes (/patient/\* --- requires PATIENT role):**

| **Path**               | **Component**       | **Description**                                                                |
|------------------------|---------------------|--------------------------------------------------------------------------------|
| /patient               | PatientDashboard    | Stats, upcoming appointments, recent prescriptions                             |
| /patient/doctors       | FindDoctors         | Search with city, rating, text filters + book button                           |
| /patient/appointments  | PatientAppointments | Full appointment management with tables, modals, pagination                    |
| /patient/book          | BookAppointment     | Multi-step booking wizard (search → select doctor → calendar → slot → confirm) |
| /patient/notifications | Notifications       | Notification center (shared component)                                         |
| /patient/profile       | PatientProfile      | View/edit profile, upload photo, manage documents                              |

**Doctor Routes (/doctor/\* --- requires DOCTOR role):**

| **Path**              | **Component**      | **Description**                                                      |
|-----------------------|--------------------|----------------------------------------------------------------------|
| /doctor               | DoctorDashboard    | Stats, PieChart, recent appointments with quick actions, email modal |
| /doctor/appointments  | DoctorAppointments | Appointment management with confirm, cancel, prescribe, history      |
| /doctor/patients      | DoctorPatients     | Patient list with visit history, email, document viewing             |
| /doctor/availability  | DoctorAvailability | Set date ranges, view/manage time slots, calendar view               |
| /doctor/feedbacks     | DoctorFeedbacks    | View received feedbacks with average rating stats                    |
| /doctor/notifications | Notifications      | Notification center (shared component)                               |
| /doctor/profile       | DoctorProfile      | View/edit profile, upload photo, manage documents                    |

**Admin Routes (/admin/\* --- requires ADMIN role):**

| Path                 | Component          | Description                                                        |
|----------------------|--------------------|--------------------------------------------------------------------|
| /admin               | AdminDashboard     | Stats, BarChart, recent appointments, people by location           |
| /admin/doctors       | ManageDoctors      | Doctor CRUD, add doctor modal, availability, documents             |
| /admin/patients      | ManagePatients     | Patient CRUD, add patient modal, documents                         |
| /admin/appointments  | ManageAppointments | Approve, reject, delete appointments with status filters           |
| /admin/feedbacks     | AdminFeedbacks     | Feedback dashboard with stats, top rated doctors, recent feedbacks |
| /admin/notifications | Notifications      | Notification center (shared component)                             |

# 

# 14. API Service Layer  {#api-service-layer}

File: (services/api.js)

Centralized Axios instance with 50+ named export functions organized by module.

### 14.1 Axios Configuration {#axios-configuration}

Request Interceptor: Attaches Authorization: Bearer \<token\> header from localStorage to every request.

Response Interceptor: On 401 responses (except login/register endpoints), clears localStorage and redirects to /login.

### 14.2 API Functions by Module {#api-functions-by-module}

Auth (5 functions):

| **Function**          | **Method** | **Endpoint**            |
|-----------------------|------------|-------------------------|
| login(data)           | POST       | /users/login            |
| registerPatient(data) | POST       | /users/register/patient |
| registerDoctor(data)  | POST       | /users/register/doctor  |
| forgotPassword(email) | POST       | /users/forgot-password  |
| resetPassword(data)   | POST       | /users/reset-password   |

**Doctors (14 functions):**

| **Function**                       | **Method** | **Endpoint**                            |
|------------------------------------|------------|-----------------------------------------|
| getAllDoctors()                    | GET        | /doctors                                |
| getDoctorById(id)                  | GET        | /doctors/{id}                           |
| getDoctorsBySpeciality(speciality) | GET        | /doctors/speciality/{speciality}        |
| searchDoctors(params)              | GET        | /doctors/search?city=X&speciality=Y     |
| addDoctor(data)                    | POST       | /doctors/add                            |
| updateDoctor(data)                 | PUT        | /doctors/update                         |
| removeDoctor(data)                 | DELETE     | /doctors/remove                         |
| addAvailability(data)              | POST       | /doctors/availability/add               |
| updateAvailability(data)           | PUT        | /doctors/availability/update            |
| deleteAvailability(id)             | DELETE     | /doctors/availability/{id}              |
| getAvailabilityByDoctor(doctorId)  | GET        | /doctors/availability/{doctorId}        |
| getAvailableSlots(doctorId, date)  | GET        | /doctors/{id}/slots?date=YYYY-MM-DD     |
| getAllSlots(doctorId, date)        | GET        | /doctors/{id}/slots/all?date=YYYY-MM-DD |
| sendDoctorEmail(data)              | POST       | /doctors/send-email                     |
| uploadDoctorPhoto(id, formData)    | POST       | /doctors/{id}/photo                     |

**Patients (9 functions):**

| **Function**                           | **Method** | **Endpoint**                      |
|----------------------------------------|------------|-----------------------------------|
| getAllPatients()                       | GET        | /patients                         |
| getPatientById(id)                     | GET        | /patients/{id}                    |
| getPatientsByDoctor(doctorId)          | GET        | /patients/by-doctor/{doctorId}    |
| getPatientsByDate(date)                | GET        | /patients/by-date/{date}          |
| registerPatientDirect(data)            | POST       | /patients/register                |
| updatePatient(data)                    | PUT        | /patients/update                  |
| removePatient(data)                    | DELETE     | /patients/remove                  |
| getPatientHistory(patientId, doctorId) | GET        | /patients/{id}/history?doctorId=X |
| uploadPatientPhoto(id, formData)       | POST       | /patients/{id}/photo              |

**Appointments (9 functions):**

| **Function**                      | **Method** | **Endpoint**                       |
|-----------------------------------|------------|------------------------------------|
| getAllAppointments()              | GET        | /appointments                      |
| getAppointmentById(id)            | GET        | /appointments/{id}                 |
| getAppointmentsByDoctor(doctorId) | GET        | /appointments/by-doctor/{doctorId} |
| bookAppointment(data)             | POST       | /appointments/book                 |
| deleteAppointment(id)             | DELETE     | /appointments/{id}                 |
| approveAppointment(id)            | PUT        | /appointments/{id}/approve         |
| rejectAppointment(id)             | PUT        | /appointments/{id}/reject          |
| confirmAppointment(id)            | PUT        | /appointments/{id}/confirm         |
| cancelAppointment(id)             | PUT        | /appointments/{id}/cancel          |

**Feedback (4 functions):**

| **Function**                            | **Method** | **Endpoint**                              |
|-----------------------------------------|------------|-------------------------------------------|
| addFeedback(data)                       | POST       | /feedbacks/add                            |
| getFeedbackById(id)                     | GET        | /feedbacks/{id}                           |
| getFeedbacksByDoctor(doctorId)          | GET        | /feedbacks/by-doctor/{doctorId}           |
| getFeedbackByAppointment(appointmentId) | GET        | /feedbacks/by-appointment/{appointmentId} |

**Admin (4 functions):**

| Function          | Method | Endpoint       |
|-------------------|--------|----------------|
| addAdmin(data)    | POST   | /admins/add    |
| updateAdmin(data) | PUT    | /admins/update |
| removeAdmin(data) | DELETE | /admins/remove |
| getAdminById(id)  | GET    | /admins/{id}   |

**Documents (7 functions):**

| **Function**                             | **Method** | **Endpoint**                                  |
|------------------------------------------|------------|-----------------------------------------------|
| uploadDocument(formData)                 | POST       | /documents/upload                             |
| uploadDoctorDocument(formData)           | POST       | /documents/doctor/upload                      |
| getDocumentsByPatient(patientId)         | GET        | /documents/patient/{patientId}                |
| getDocumentsByDoctor(doctorId)           | GET        | /documents/doctor/{doctorId}                  |
| getDocumentsByAppointment(appointmentId) | GET        | /documents/appointment/{appointmentId}        |
| downloadDocument(documentId)             | GET        | /documents/{id}/download (responseType: blob) |
| deleteDocument(documentId)               | DELETE     | /documents/{documentId}                       |

**Medicines (4 functions):**

| **Function**                             | **Method** | **Endpoint**                           |
|------------------------------------------|------------|----------------------------------------|
| addMedicines(appointmentId, medicines)   | POST       | /medicines/appointment/{appointmentId} |
| getMedicinesByAppointment(appointmentId) | GET        | /medicines/appointment/{appointmentId} |
| updateMedicine(medicineId, data)         | PUT        | /medicines/{medicineId}                |
| deleteMedicine(medicineId)               | DELETE     | /medicines/{medicineId}                |

**Notifications (5 functions):**

| **Function**                     | **Method** | **Endpoint**                         |
|----------------------------------|------------|--------------------------------------|
| getNotifications(userId)         | GET        | /notifications/{userId}              |
| getUnreadCount(userId)           | GET        | /notifications/{userId}/unread-count |
| markNotificationRead(id)         | PUT        | /notifications/{id}/read             |
| markAllNotificationsRead(userId) | PUT        | /notifications/{userId}/read-all     |
| deleteNotification(id)           | DELETE     | /notifications/{id}                  |

# 15. Page-by-Page Feature Details {#page-by-page-feature-details}

### 15.1 Landing Page (LandingPage.jsx) {#landing-page-landingpage.jsx}

A full-featured public marketing page with:

- Animated hero section with HeroBackground blobs, heading, subtitle, and \"Book an Appointment\" CTA

- Specializations grid: 16 specializations displayed as icon cards (Cardiology, Neurology, Oncology, Nephrology, Gastroenterology, Orthopaedics, Ophthalmology, Pulmonology, Gynaecology, Dermatology, ENT, Diabetes, General Surgery, Vascular Surgery, Internal Medicine, Haematology)

- Statistics section: Animated counters (250+ doctors, 1000+ appointments, etc.)

- Testimonials carousel: Auto-rotating (4s interval) patient testimonials with star ratings

- Footer with quick links to public pages

- Sticky navbar with scroll-based shadow effect

### 15.2 Login Page (Login.jsx) {#login-page-login.jsx}

Dual login mode toggle: Username or Mobile Number

- Mobile mode: Country code dropdown (15 countries: India, USA, UK, Australia, UAE, etc.) + mobile number

- Username mode: Standard username input

- Password field with show/hide toggle

- Client-side validation: Required fields, mobile format (7-15 digits), password length (4-18 chars)

- On success: Calls loginUser(), navigates to /{role} dashboard

- Links to Register and Forgot Password pages

### 15.3 Register Page (Register.jsx) {#register-page-register.jsx}

Role toggle: Patient or Doctor (switches the form dynamically)

- Patient form fields: Username, Password, Confirm Password, Full Name, Country Code + Mobile, Email, Blood Group (dropdown), Gender (dropdown), Age, Address, City (CitySelect component)

- Doctor form fields: Username, Password, Confirm Password, Full Name, Speciality (SpecializationSelect component), Location, Hospital Name, Country Code + Mobile, Email, Charge Per Visit, City (CitySelect component)

- Validation: Username (alphanumeric), Password (regex: 8-20 chars with upper, lower, digit, special), Confirm Password match, required fields per role

- On success: Navigates to /login

### 15.4 Password Recovery Pages {#password-recovery-pages}

- ForgotPassword.jsx: Email input → calls forgotPassword() → shows success message

- ResetPassword.jsx: Reads ?token= from URL query params → New Password + Confirm Password form → calls resetPassword() → navigates to /login

### 15.5 Public Pages {#public-pages}

| **Page**       | **Key Features**                                                                                                                                                           |
|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| PublicDoctors  | Doctor cards with name, speciality, hospital, city, rating, consultation fee. Filters: text search, specialization buttons (17 options), city dropdown. No login required. |
| Services       | 8 service cards (Book Appointment, Find Doctor, Availability, Prescriptions, Feedback, Documents, Notifications, Dashboard Analytics) with feature bullet points           |
| About          | Platform description, team values, mission/vision                                                                                                                          |
| Contact        | Contact form (name, email, subject, message) with toast notification on submit                                                                                             |
| PrivacyPolicy  | Static privacy policy content                                                                                                                                              |
| TermsOfService | Static terms of service content                                                                                                                                            |

### 15.6 Patient Dashboard (PatientDashboard.jsx) {#patient-dashboard-patientdashboard.jsx}

- Stat Cards (4): Total Appointments, Pending, Confirmed, Doctors Visited.

- Upcoming Appointments: Next 5 upcoming (PENDING/APPROVED/CONFIRMED) appointments sorted by date, showing doctor name, specialty, date, time slot, and status badge.

- Recent Prescriptions: Fetches medicines for all CONFIRMED/APPROVED appointments. Shows medicine cards with name, dosage, frequency, duration, and notes.

### 15.7 Find Doctors (FindDoctors.jsx) {#find-doctors-finddoctors.jsx}

Three combined filters:

- Text search --- Name, specialty, or hospital (col-md-6).

- City dropdown --- Dynamically populated from loaded doctors\' cities (col-md-3).

- Rating dropdown --- All Ratings / 4+ / 3+ / 2+ / 1+ Stars (col-md-3).

Doctor cards show: Profile photo (or default avatar), name, specialty badge, hospital, location, charge per visit (₹), average rating with star + review count, availability date ranges (green) or \"No availability set\" (red), and \"Book Appointment\" button.

Clicking \"Book Appointment\" navigates to /patient/book with the doctor object passed via location.state.

### 15.8 Book Appointment (BookAppointment.jsx) {#book-appointment-bookappointment.jsx}

Multi-step wizard:

| **Step** | **Name**         | **Description**                                                                                                                                                                                              |
|----------|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1        | Search Doctors   | Select specialization (SpecializationSelect) and/or city (CitySelect), search, view result cards with ratings.                                                                                               |
| 2        | Select Date      | Calendar month-view showing available dates (highlighted green). Navigates months. Uses eachDayOfInterval from date-fns.                                                                                     |
| 3        | Select Time Slot | Grid of available time slots for the selected date. Booked slots are disabled.                                                                                                                               |
| 4        | Confirm & Book   | Summary card showing doctor, date, time slot, optional remark textarea. Submit calls bookAppointment(). If navigated from FindDoctors with a pre-selected doctor, skips directly to step 2 (date selection). |

### 15.9 Patient Appointments (PatientAppointments.jsx) {#patient-appointments-patientappointments.jsx}

- **Stat Cards (5):** Total, Upcoming, Confirmed, Pending, Cancelled.

- **Next Appointment Banner:** Gradient card showing next upcoming appointment with countdown (\"Today\", \"Tomorrow\", \"In X days\").

- Search/Sort/Filter Bar:

<!-- -->

- Text search (doctor, specialty, remark).

- Sort (Newest First / Oldest First).

- **Status filter buttons with counts**: ALL, PENDING, APPROVED, CONFIRMED, CANCELLED, REJECTED.

Appointments Table with pagination (6 per page):

- Columns: \#, Doctor (name + specialty badge), Date & Time (with \"Today\" badge), Status, Remark (truncated), Actions.

- Upcoming appointments highlighted with blue left border.

Action Buttons per appointment:

| **Button**                  | **Condition**                      | **Action**                       |
|-----------------------------|------------------------------------|----------------------------------|
| View Details (eye)          | Always                             | Opens detail modal.              |
| Cancel (x-circle)           | PENDING or APPROVED                | Opens cancel confirmation modal. |
| Give Feedback (chat)        | APPROVED/CONFIRMED + not yet given | Opens feedback modal.            |
| Feedback Given (checkmark)  | APPROVED/CONFIRMED + already given | Disabled green button.           |
| View Prescription (capsule) | Always                             | Opens prescription modal.        |
| Book Appointment            | Header button                      | Navigates to /patient/book.      |

Modals:

- Appointment Detail Modal: Doctor info, date, time, status, remark.

- Cancel Confirmation Modal: Warning icon, doctor name, confirm/cancel buttons.

- Feedback Modal: Doctor info, 5-star interactive rating with hover effect, 500-char comment textarea, rating labels (Poor→Excellent). Sends appointment reference with feedback. Handles 409 duplicate error.

- Prescription Modal: Doctor info, date, medicine cards (name, dosage, frequency, duration, notes).

- Per-Appointment Feedback: Checks feedback status via getFeedbackByAppointment() on load. Tracks in feedbackGiven state map.

### 15.10 Patient Profile (PatientProfile.jsx) {#patient-profile-patientprofile.jsx}

- View/Edit mode toggle.

- Profile photo: Upload (max 2MB), converted to Base64 server-side.

- Editable fields: Name, email, mobile, age, gender, blood group, address, city (CitySelect).

- Documents section: Upload documents (multipart), list with file name/type/date/description, download (blob), delete.

### 15.11 Doctor Dashboard (DoctorDashboard.jsx) {#doctor-dashboard-doctordashboard.jsx}

- Stat Cards (4): Total Appointments, Total Patients, Average Rating, Pending Requests.

- Appointment Status PieChart: Recharts PieChart with 3 segments (Pending, Approved/Confirmed, Rejected/Cancelled).

- Today\'s Appointments: Filtered list of today\'s appointments with quick-action buttons (Approve, Reject, Confirm).

- Action Modal: When approving/rejecting, an optional message modal opens. If the patient has an email, the message is sent via sendDoctorEmail().

- Recent Patients: Last 5 unique patients with names and appointment dates.

### 15.12 Doctor Appointments (DoctorAppointments.jsx) {#doctor-appointments-doctorappointments.jsx}

- Filters:

<!-- -->

- Period filter: ALL, Today, Tomorrow, This Week, This Month.

- Status filter: Active (PENDING + APPROVED + CONFIRMED), Completed, Cancelled/Rejected, ALL.

Appointment cards with: Patient name, date, time slot, status badge, remark.

Actions per appointment:

- Confirm (for APPROVED appointments).

- Cancel (with confirmation dialog).

- Prescribe/View Prescription: Modal with add medicine form (name, dosage, frequency, duration, notes), dynamic rows, batch save. If medicines already exist, shows view mode with existing medicines.

- View History: Opens history modal showing all past appointments between this patient and doctor via getPatientHistory().

- Detail Modal: Full appointment info with patient details.

### 15.13 Doctor Patients (DoctorPatients.jsx) {#doctor-patients-doctorpatients.jsx}

Lists all patients who have appointments with the doctor (via getPatientsByDoctor).

Patient cards with: Name, age, gender, blood group, city, email, mobile.

Actions per patient:

- View History: Complete visit history via getPatientHistory() showing appointment dates, statuses, time slots, remarks, and prescribed medicines.

- Send Email: Modal to compose and send email to patient via sendDoctorEmail().

- View Documents: Modal listing patient\'s documents with download functionality.

### 15.14 Doctor Availability (DoctorAvailability.jsx) {#doctor-availability-doctoravailability.jsx}

- Quick Stats: Active date ranges, total availability days.

- Add Availability Form: From Date and End Date inputs → calls addAvailability().

- Existing Date Ranges: Cards showing each range with Edit and Delete buttons.

- Edit Modal: Update fromDate/endDate.

- Delete: Confirmation before deletion.

- Time Slots Calendar: Weekly calendar view with navigation (prev/next week). Clicking a date loads all time slots for that date via getAllSlots(). Shows slot grid with start/end times, booked/available status with color coding.

### 15.15 Doctor Feedbacks (DoctorFeedbacks.jsx) {#doctor-feedbacks-doctorfeedbacks.jsx}

- Average Rating Card: Shows computed average rating with star icon and review count.

- Feedback Cards: Each showing patient name, star rating (1-5 filled/empty stars), and comment text.

### 15.16 Doctor Profile (DoctorProfile.jsx) {#doctor-profile-doctorprofile.jsx}

- View/Edit mode toggle.

- Profile photo upload (converted to Base64).

- Editable fields: Name, specialty, hospital, location, city (CitySelect), mobile, email, charge per visit.

- Doctor Documents section: Upload documents (with optional description), list, download, delete.

### 15.17 Admin Dashboard (AdminDashboard.jsx) {#admin-dashboard-admindashboard.jsx}

- Stat Cards (4): Total Doctors (StatCard), Total Patients, Total Appointments, Pending count.

- Appointments by Status BarChart: Recharts BarChart with ResponsiveContainer, CartesianGrid, Tooltip, Legend showing counts for PENDING, APPROVED, CONFIRMED, REJECTED, CANCELLED.

- Recent Appointments: Last 5 appointments (patient → doctor, date, status badge).

- People by Location: City dropdown filter. Shows two-column layout:

<!-- -->

- Patients in city: Profile photo, name, email, age, city.

- Doctors in city: Profile photo, name, email, specialty, city, consultation fee.

### 15.18 Manage Doctors (ManageDoctors.jsx) {#manage-doctors-managedoctors.jsx}

Features:

- Doctor cards with specialty color-coding (50+ specialty-to-color mappings).

- Search/filter by name, specialty, hospital.

- Add Doctor Modal: Full registration form with SpecializationSelect dropdown, CitySelect dropdown, password validation. Calls registerDoctor().

- Edit Doctor Modal: Update all doctor fields.

- Remove Doctor: Confirmation before deletion.

- Manage Availability: Inline availability dates with add/edit/delete.

- View Documents: Modal with document list and download.

### 15.19 Manage Patients (ManagePatients.jsx) {#manage-patients-managepatients.jsx}

Features:

- Patient cards with gender icons/colors, blood group color-coding.

- Search/filter by name, email, city.

- Add Patient Modal: Full registration form with gender dropdown, blood group dropdown. Calls registerPatient().

- Edit Patient Modal: Update all patient fields.

- Remove Patient: Confirmation before deletion.

- View Documents: Modal with document list and download.

### 15.20 Manage Appointments (ManageAppointments.jsx) {#manage-appointments-manageappointments.jsx}

Status filter buttons with counts: ALL, PENDING, APPROVED, CONFIRMED, REJECTED, CANCELLED.

Appointment table with: Patient name, Doctor name, Date, Status (StatusBadge), and action buttons:

- Approve (for PENDING).

- Reject (with confirmation).

- Delete (permanent, with confirmation --- Admin only).

### 15.21 Admin Feedbacks (AdminFeedbacks.jsx) {#admin-feedbacks-adminfeedbacks.jsx}

- Statistics Row (4 cards): Total Feedbacks, Average Rating, Doctors Reviewed, Highest Rating.

- Two-panel layout:

<!-- -->

- Top Rated Doctors (col-lg-5): Top 5 doctors by average rating with colored initials avatars, name, specialty, star rating, review count.

- Recent Feedbacks (col-lg-7): 10 most recent feedbacks in a table with Patient, Doctor, Star rating (5 visual stars), Comment (truncated with tooltip).

### 15.22 Notifications (Notifications.jsx --- Shared) {#notifications-notifications.jsx-shared}

Full-page notification center available at /{role}/notifications for all roles.

Features:

- Filter toggle: All / Unread (with counts).

- Mark all read button (when unread notifications exist).

- Notification list: Each item shows type-specific icon + color, title, \"New\" badge for unread, message, relative timestamp, delete button.

- Click to mark as read.

- Delete individual notifications with toast confirmation.

- Type-specific icons and colors (same mapping as TopNavbar).

# 16. Future Works {#future-works}

1.  **Payment Gateway Integration**: Integrate Razorpay, Stripe, or PayPal for online consultation fee payment during appointment booking.

2.  **SMS Notifications:** Send appointment confirmation, reminder, and cancellation alerts via SMS using Twilio or AWS SNS.

3.  **Cloud Storage for Documents:** Migrate file storage to AWS S3 or Azure Blob Storage for durability, scalability, and CDN-based delivery.

4.  **Video Consultation Feature:** Integrate WebRTC or a third-party service (e.g., Twilio Video, Agora) for tele-medicine consultations.

5.  **Containerization**: Dockerize both frontend and backend, create docker-compose.yml for local development, and deploy to Kubernetes for production.

6.  **CI/CD Pipeline:** Set up GitHub Actions or Jenkins for automated build, test, and deployment.

7.  **Multi-Language Support (i18n):** Internationalization for the frontend to support multiple languages.

8.  **Profile Photo Cloud Storage:** Move profile photos from Base64 DB columns to cloud object storage with URL references.

9.  **AI ChatBot:** Implementing ai chat support to ease the selection of doctors for appointments and auto-integration of booking the preferred timing.

# 17. Features Overview {#features-overview}

1.  **Authentication & Security** --- Secure JWT-based login with role-based access (Patient, Doctor, Admin).

2.  **User Management** --- Registration and profile management for patients, doctors, and admins.

3.  **Patient Module** --- Patients can search doctors, book appointments, and manage health records.

4.  **Doctor Module** --- Doctors handle appointments, availability, prescriptions, and patient history.

5.  **Admin Module** --- Admin controls users, appointments, and system analytics.

6.  **Appointment System** --- End-to-end booking system with slot management and status tracking.

7.  **Notification System** --- Real-time alerts for appointments, feedback, and actions.

8.  **Feedback System** --- Patients rate doctors and provide reviews per appointment.

9.  **Document Management** --- Upload, view, and manage medical documents securely.

10. **Prescription Management** --- Doctors create and manage medicines for patients.

11. **Email Service** --- Email support for password reset and doctor-patient communication.

12. **Public Pages** --- Informational pages accessible without login.

13. **UI/UX Features** --- Responsive dashboards with charts, filters, and modern UI.

14. **API & Architecture** --- Structured Spring Boot backend with REST APIs and layered design.

15. **Database** --- MySQL database with 12 tables supporting all modules.
