package com.doctorapp.config;

import com.doctorapp.entity.*;
import com.doctorapp.repository.jpa.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
@ConditionalOnProperty(name = "app.seed-data", havingValue = "true", matchIfMissing = false)
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private static final String DEFAULT_PASSWORD = "Password@123";

    @Autowired private UserJpaRepository userRepo;
    @Autowired private AdminJpaRepository adminRepo;
    @Autowired private DoctorJpaRepository doctorRepo;
    @Autowired private PatientJpaRepository patientRepo;
    @Autowired private AvailabilityDatesJpaRepository availabilityRepo;
    @Autowired private TimeSlotJpaRepository timeSlotRepo;
    @Autowired private AppointmentJpaRepository appointmentRepo;
    @Autowired private FeedbackJpaRepository feedbackRepo;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepo.count() > 0) {
            log.info("Database already has data — skipping seed.");
            return;
        }

        log.info("Seeding demo data...");
        String encoded = passwordEncoder.encode(DEFAULT_PASSWORD);

        // ── Users ───────────────────────────────────────────────
        User adminUser = saveUser("admin1", encoded, "ADMIN");
        User doctorUser1 = saveUser("doctor1", encoded, "DOCTOR");
        User doctorUser2 = saveUser("doctor2", encoded, "DOCTOR");
        User doctorUser3 = saveUser("doctor3", encoded, "DOCTOR");
        User patientUser1 = saveUser("patient1", encoded, "PATIENT");
        User patientUser2 = saveUser("patient2", encoded, "PATIENT");
        User patientUser3 = saveUser("patient3", encoded, "PATIENT");

        // ── Admin ───────────────────────────────────────────────
        Admin admin = new Admin();
        admin.setAdminName("Super Admin");
        admin.setContactNumber("9000000001");
        admin.setEmail("admin@clinicforge.com");
        admin.setPassword(encoded);
        admin.setUser(adminUser);
        adminRepo.save(admin);

        // ── Doctors ─────────────────────────────────────────────
        Doctor doc1 = createDoctor("Dr. Sarah Johnson", "Cardiology", "Manhattan",
                "New York", "City Hospital", "9100000001", "sarah.johnson@clinicforge.com",
                encoded, 500.0, doctorUser1);
        Doctor doc2 = createDoctor("Dr. Michael Chen", "Dermatology", "Beverly Hills",
                "Los Angeles", "Skin Care Clinic", "9100000002", "michael.chen@clinicforge.com",
                encoded, 400.0, doctorUser2);
        Doctor doc3 = createDoctor("Dr. Emily Davis", "Pediatrics", "Lincoln Park",
                "Chicago", "Children's Medical Center", "9100000003", "emily.davis@clinicforge.com",
                encoded, 350.0, doctorUser3);

        // ── Patients ────────────────────────────────────────────
        Patient pat1 = createPatient("John Smith", "8200000001", "john.smith@email.com",
                encoded, "O+", "Male", 35, "123 Main St", "New York", patientUser1);
        Patient pat2 = createPatient("Jane Doe", "8200000002", "jane.doe@email.com",
                encoded, "A+", "Female", 28, "456 Oak Ave", "Los Angeles", patientUser2);
        Patient pat3 = createPatient("Robert Wilson", "8200000003", "robert.wilson@email.com",
                encoded, "B+", "Male", 45, "789 Pine Rd", "Chicago", patientUser3);

        // ── Availability & Time Slots ───────────────────────────
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        for (Doctor doc : List.of(doc1, doc2, doc3)) {
            AvailabilityDates avail = new AvailabilityDates();
            avail.setDoctor(doc);
            avail.setFromDate(tomorrow);
            avail.setEndDate(tomorrow.plusDays(4));
            availabilityRepo.save(avail);

            // Generate 30-min time slots (09:00–17:00) for each day
            for (int d = 0; d < 5; d++) {
                LocalDate slotDate = tomorrow.plusDays(d);
                LocalTime time = LocalTime.of(9, 0);
                while (time.isBefore(LocalTime.of(17, 0))) {
                    TimeSlot slot = new TimeSlot();
                    slot.setDoctor(doc);
                    slot.setDate(slotDate);
                    slot.setStartTime(time);
                    slot.setEndTime(time.plusMinutes(30));
                    slot.setBooked(false);
                    timeSlotRepo.save(slot);
                    time = time.plusMinutes(30);
                }
            }
        }

        // ── Appointments ────────────────────────────────────────
        // Get first-day slots for each doctor to link appointments
        List<TimeSlot> doc1Slots = timeSlotRepo.findByDoctorAndDate(doc1, tomorrow);
        List<TimeSlot> doc2Slots = timeSlotRepo.findByDoctorAndDate(doc2, tomorrow);
        List<TimeSlot> doc3Slots = timeSlotRepo.findByDoctorAndDate(doc3, tomorrow);

        // Patient1 → Doctor1 (APPROVED)
        createAppointment(pat1, doc1, tomorrow, "APPROVED",
                "Regular cardiac checkup", getAndBookSlot(doc1Slots, 0));

        // Patient2 → Doctor2 (PENDING)
        createAppointment(pat2, doc2, tomorrow, "PENDING",
                "Skin rash consultation", getAndBookSlot(doc2Slots, 0));

        // Patient3 → Doctor3 (CONFIRMED)
        createAppointment(pat3, doc3, tomorrow, "CONFIRMED",
                "Child vaccination", getAndBookSlot(doc3Slots, 0));

        // Patient1 → Doctor3 (PENDING) — second day
        List<TimeSlot> doc3Day2Slots = timeSlotRepo.findByDoctorAndDate(doc3, tomorrow.plusDays(1));
        createAppointment(pat1, doc3, tomorrow.plusDays(1), "PENDING",
                "Pediatric follow-up", getAndBookSlot(doc3Day2Slots, 0));

        // Patient2 → Doctor1 (APPROVED) — second day
        List<TimeSlot> doc1Day2Slots = timeSlotRepo.findByDoctorAndDate(doc1, tomorrow.plusDays(1));
        createAppointment(pat2, doc1, tomorrow.plusDays(1), "APPROVED",
                "Heart palpitation concern", getAndBookSlot(doc1Day2Slots, 0));

        // ── Feedbacks ───────────────────────────────────────────
        createFeedback(pat1, doc1, 5, "Excellent cardiologist. Very thorough examination.");
        createFeedback(pat2, doc2, 4, "Good dermatologist. Prescribed effective treatment.");
        createFeedback(pat3, doc3, 5, "Amazing with kids. Very patient and caring.");
        createFeedback(pat2, doc1, 3, "Good doctor but long wait time.");

        log.info("Demo data seeded successfully!");
        log.info("Login credentials — username / password:");
        log.info("  Admin:    admin1   / {}", DEFAULT_PASSWORD);
        log.info("  Doctors:  doctor1  / {}", DEFAULT_PASSWORD);
        log.info("            doctor2  / {}", DEFAULT_PASSWORD);
        log.info("            doctor3  / {}", DEFAULT_PASSWORD);
        log.info("  Patients: patient1 / {}", DEFAULT_PASSWORD);
        log.info("            patient2 / {}", DEFAULT_PASSWORD);
        log.info("            patient3 / {}", DEFAULT_PASSWORD);
    }

    // ── Helper Methods ──────────────────────────────────────────

    private User saveUser(String userName, String encodedPassword, String role) {
        User user = new User();
        user.setUserName(userName);
        user.setPassword(encodedPassword);
        user.setRole(role);
        return userRepo.save(user);
    }

    private Doctor createDoctor(String name, String speciality, String location,
                                String city, String hospital, String mobile,
                                String email, String encodedPwd, double charge, User user) {
        Doctor doc = new Doctor();
        doc.setDoctorName(name);
        doc.setSpeciality(speciality);
        doc.setLocation(location);
        doc.setCity(city);
        doc.setHospitalName(hospital);
        doc.setMobileNo(mobile);
        doc.setEmail(email);
        doc.setPassword(encodedPwd);
        doc.setChargedPerVisit(charge);
        doc.setUser(user);
        return doctorRepo.save(doc);
    }

    private Patient createPatient(String name, String mobile, String email,
                                  String encodedPwd, String blood, String gender,
                                  int age, String address, String city, User user) {
        Patient pat = new Patient();
        pat.setPatientName(name);
        pat.setMobileNo(mobile);
        pat.setEmail(email);
        pat.setPassword(encodedPwd);
        pat.setBloodGroup(blood);
        pat.setGender(gender);
        pat.setAge(age);
        pat.setAddress(address);
        pat.setCity(city);
        pat.setUser(user);
        return patientRepo.save(pat);
    }

    private Appointment createAppointment(Patient patient, Doctor doctor,
                                          LocalDate date, String status,
                                          String remark, TimeSlot slot) {
        Appointment appt = new Appointment();
        appt.setPatient(patient);
        appt.setDoctor(doctor);
        appt.setAppointmentDate(date);
        appt.setAppointmentStatus(status);
        appt.setRemark(remark);
        appt.setTimeSlot(slot);
        return appointmentRepo.save(appt);
    }

    private void createFeedback(Patient patient, Doctor doctor, int rating, String comment) {
        Feedback fb = new Feedback();
        fb.setPatient(patient);
        fb.setDoctor(doctor);
        fb.setRating(rating);
        fb.setFeedbackComment(comment);
        feedbackRepo.save(fb);
    }

    private TimeSlot getAndBookSlot(List<TimeSlot> slots, int index) {
        if (slots == null || slots.isEmpty() || index >= slots.size()) {
            return null;
        }
        TimeSlot slot = slots.get(index);
        slot.setBooked(true);
        return timeSlotRepo.save(slot);
    }
}
