package com.doctorapp.controller;

import com.doctorapp.dto.ApiResponse;
import com.doctorapp.entity.AvailabilityDates;
import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.TimeSlot;
import com.doctorapp.repository.jpa.AvailabilityDatesJpaRepository;
import com.doctorapp.repository.jpa.DoctorJpaRepository;
import com.doctorapp.repository.jpa.TimeSlotJpaRepository;
import com.doctorapp.service.IDoctorService;
import com.doctorapp.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@Tag(name = "Doctor Module", description = "Doctor profile and availability management")
public class DoctorController {

    @Autowired
    private IDoctorService doctorService;

    @Autowired
    private DoctorJpaRepository doctorJpaRepository;

    @Autowired
    private AvailabilityDatesJpaRepository availabilityDatesJpaRepository;

    @Autowired
    private TimeSlotJpaRepository timeSlotJpaRepository;

    @Autowired
    private EmailService emailService;

    @Operation(summary = "Add a new doctor")
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<Doctor>> addDoctor(@Valid @RequestBody Doctor doctor) {
        Doctor created = doctorService.addDoctor(doctor);
        return new ResponseEntity<>(ApiResponse.created("Doctor added successfully", created), HttpStatus.CREATED);
    }

    @Operation(summary = "Update doctor profile")
    @PutMapping("/update")
    public ResponseEntity<ApiResponse<Doctor>> updateDoctor(@Valid @RequestBody Doctor doctor) {
        Doctor updated = doctorService.updateDoctorProfile(doctor);
        return ResponseEntity.ok(ApiResponse.success("Doctor profile updated successfully", updated));
    }

    @Operation(summary = "Remove a doctor")
    @DeleteMapping("/remove")
    public ResponseEntity<ApiResponse<Doctor>> removeDoctor(@RequestBody Doctor doctor) {
        Doctor removed = doctorService.removeDoctor(doctor);
        return ResponseEntity.ok(ApiResponse.deleted("Doctor removed successfully", removed));
    }

    @Operation(summary = "Get doctor by ID")
    @GetMapping("/{doctorId}")
    public ResponseEntity<ApiResponse<Doctor>> getDoctor(@PathVariable int doctorId) {
        Doctor probe = new Doctor();
        probe.setDoctorId(doctorId);
        Doctor found = doctorService.getDoctor(probe);
        return ResponseEntity.ok(ApiResponse.success("Doctor retrieved successfully", found));
    }

    @Operation(summary = "Get all doctors")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Doctor>>> getAllDoctors() {
        List<Doctor> doctors = doctorService.getDoctorList();
        return ResponseEntity.ok(ApiResponse.success("Doctors retrieved successfully", doctors));
    }

    @Operation(summary = "Get doctors by speciality")
    @GetMapping("/speciality/{speciality}")
    public ResponseEntity<ApiResponse<List<Doctor>>> getDoctorsBySpeciality(@PathVariable String speciality) {
        List<Doctor> doctors = doctorService.getDoctorList(speciality);
        return ResponseEntity.ok(ApiResponse.success("Doctors retrieved for speciality: " + speciality, doctors));
    }

    @Operation(summary = "Search doctors by city and/or speciality")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Doctor>>> searchDoctors(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String speciality) {
        List<Doctor> doctors;
        if (city != null && !city.isBlank() && speciality != null && !speciality.isBlank()) {
            doctors = doctorJpaRepository.findByCityAndSpeciality(city, speciality);
        } else if (city != null && !city.isBlank()) {
            doctors = doctorJpaRepository.findByCity(city);
        } else if (speciality != null && !speciality.isBlank()) {
            doctors = doctorService.getDoctorList(speciality);
        } else {
            doctors = doctorService.getDoctorList();
        }
        return ResponseEntity.ok(ApiResponse.success("Doctors retrieved successfully", doctors));
    }

    @Operation(summary = "Get availability dates for a doctor")
    @GetMapping("/availability/{doctorId}")
    public ResponseEntity<ApiResponse<List<AvailabilityDates>>> getAvailability(@PathVariable int doctorId) {
        Doctor doctor = new Doctor();
        doctor.setDoctorId(doctorId);
        List<AvailabilityDates> dates = availabilityDatesJpaRepository.findByDoctor(doctor);
        return ResponseEntity.ok(ApiResponse.success("Availability retrieved", dates));
    }

    @Operation(summary = "Add doctor availability dates")
    @PostMapping("/availability/add")
    public ResponseEntity<ApiResponse<AvailabilityDates>> addAvailability(
            @Valid @RequestBody AvailabilityDates availabilityDates) {
        AvailabilityDates created = doctorService.addAvailability(availabilityDates);
        return new ResponseEntity<>(ApiResponse.created("Availability added successfully", created),
                HttpStatus.CREATED);
    }

    @Operation(summary = "Update doctor availability dates")
    @PutMapping("/availability/update")
    public ResponseEntity<ApiResponse<AvailabilityDates>> updateAvailability(
            @Valid @RequestBody AvailabilityDates availabilityDates) {
        AvailabilityDates updated = doctorService.updateAvailability(availabilityDates);
        return ResponseEntity.ok(ApiResponse.success("Availability updated successfully", updated));
    }

    @Operation(summary = "Delete doctor availability dates")
    @DeleteMapping("/availability/{availabilityId}")
    public ResponseEntity<ApiResponse<Void>> deleteAvailability(@PathVariable int availabilityId) {
        availabilityDatesJpaRepository.deleteById(availabilityId);
        return ResponseEntity.ok(ApiResponse.success("Availability deleted successfully", null));
    }

    @Operation(summary = "Get available (unbooked) time slots for a doctor on a date")
    @GetMapping("/{doctorId}/slots")
    public ResponseEntity<ApiResponse<List<TimeSlot>>> getAvailableSlots(
            @PathVariable int doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Doctor doctor = new Doctor();
        doctor.setDoctorId(doctorId);
        List<TimeSlot> slots = timeSlotJpaRepository.findByDoctorAndDateAndIsBookedFalse(doctor, date);
        return ResponseEntity.ok(ApiResponse.success("Available slots retrieved", slots));
    }

    @Operation(summary = "Get all time slots for a doctor on a date")
    @GetMapping("/{doctorId}/slots/all")
    public ResponseEntity<ApiResponse<List<TimeSlot>>> getAllSlots(
            @PathVariable int doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Doctor doctor = new Doctor();
        doctor.setDoctorId(doctorId);
        List<TimeSlot> slots = timeSlotJpaRepository.findByDoctorAndDate(doctor, date);
        return ResponseEntity.ok(ApiResponse.success("All slots retrieved", slots));
    }

    @Operation(summary = "Send email to a patient")
    @PostMapping("/send-email")
    public ResponseEntity<ApiResponse<Void>> sendEmailToPatient(@RequestBody java.util.Map<String, String> payload) {
        String to = payload.get("to");
        String subject = payload.get("subject");
        String body = payload.get("body");
        if (to == null || subject == null || body == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("to, subject, and body are required"));
        }
        emailService.sendEmail(to, subject, body);
        return ResponseEntity.ok(ApiResponse.success("Email sent successfully", null));
    }

    @Operation(summary = "Upload doctor profile photo")
    @PostMapping("/{doctorId}/photo")
    public ResponseEntity<ApiResponse<String>> uploadPhoto(@PathVariable int doctorId,
            @RequestParam("file") MultipartFile file) {
        try {
            Doctor probe = new Doctor();
            probe.setDoctorId(doctorId);
            Doctor doctor = doctorService.getDoctor(probe);
            String base64 = "data:" + file.getContentType() + ";base64,"
                    + Base64.getEncoder().encodeToString(file.getBytes());
            doctor.setProfilePhoto(base64);
            doctorJpaRepository.save(doctor);
            return ResponseEntity.ok(ApiResponse.success("Photo uploaded successfully", base64));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to upload photo"));
        }
    }
}
