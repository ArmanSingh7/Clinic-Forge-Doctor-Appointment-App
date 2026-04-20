package com.doctorapp.controller;

import com.doctorapp.dto.ApiResponse;
import com.doctorapp.dto.AppointmentDTO;
import com.doctorapp.entity.Appointment;
import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Patient;
import com.doctorapp.exception.ResourceNotFoundException;
import com.doctorapp.repository.jpa.DoctorJpaRepository;
import com.doctorapp.repository.jpa.PatientJpaRepository;
import com.doctorapp.service.IAppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@Tag(name = "Appointment Module", description = "Book, update, delete and query appointments")
public class AppointmentController {

    @Autowired
    private IAppointmentService appointmentService;

    @Autowired
    private PatientJpaRepository patientJpaRepository;

    @Autowired
    private DoctorJpaRepository doctorJpaRepository;

    @Operation(summary = "Get all appointments")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Appointment>>> getAllAppointments() {
        List<Appointment> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved successfully", appointments));
    }

    @Operation(summary = "Get appointment by ID")
    @GetMapping("/{appointmentId}")
    public ResponseEntity<ApiResponse<Appointment>> getAppointment(@PathVariable int appointmentId) {
        Appointment appointment = appointmentService.getAppointment(appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Appointment retrieved successfully", appointment));
    }

    @Operation(summary = "Book a new appointment (validates doctor availability)")
    @PostMapping("/book")
    public ResponseEntity<ApiResponse<Appointment>> bookAppointment(@Valid @RequestBody AppointmentDTO dto) {
        Appointment created = appointmentService.bookAppointment(dto);
        return new ResponseEntity<>(ApiResponse.created("Appointment booked successfully", created), HttpStatus.CREATED);
    }

    @Operation(summary = "Delete appointment by ID (hard delete)")
    @DeleteMapping("/{appointmentId}")
    public ResponseEntity<ApiResponse<Appointment>> deleteAppointment(@PathVariable int appointmentId) {
        Appointment deleted = appointmentService.deleteAppointment(appointmentId);
        return ResponseEntity.ok(ApiResponse.deleted("Appointment deleted successfully", deleted));
    }

    @Operation(summary = "Approve an appointment")
    @PutMapping("/{appointmentId}/approve")
    public ResponseEntity<ApiResponse<Appointment>> approveAppointment(@PathVariable int appointmentId) {
        Appointment approved = appointmentService.approveAppointment(appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Appointment approved", approved));
    }

    @Operation(summary = "Reject an appointment")
    @PutMapping("/{appointmentId}/reject")
    public ResponseEntity<ApiResponse<Appointment>> rejectAppointment(@PathVariable int appointmentId) {
        Appointment rejected = appointmentService.rejectAppointment(appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Appointment rejected", rejected));
    }

    @Operation(summary = "Confirm an appointment")
    @PutMapping("/{appointmentId}/confirm")
    public ResponseEntity<ApiResponse<Appointment>> confirmAppointment(@PathVariable int appointmentId) {
        Appointment confirmed = appointmentService.confirmAppointment(appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Appointment confirmed", confirmed));
    }

    @Operation(summary = "Cancel an appointment")
    @PutMapping("/{appointmentId}/cancel")
    public ResponseEntity<ApiResponse<Appointment>> cancelAppointment(@PathVariable int appointmentId) {
        Appointment cancelled = appointmentService.cancelAppointment(appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled", cancelled));
    }

    @Operation(summary = "Get appointments by doctor ID")
    @GetMapping("/by-doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<Appointment>>> getAppointmentsByDoctor(@PathVariable int doctorId) {
        Doctor doctor = doctorJpaRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "doctorId", doctorId));
        List<Appointment> appointments = appointmentService.getAppointments(doctor);
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved for doctor", appointments));
    }

    @Operation(summary = "Get appointments by patient ID")
    @GetMapping("/by-patient/{patientId}")
    public ResponseEntity<ApiResponse<List<Appointment>>> getAppointmentsByPatient(@PathVariable int patientId) {
        Patient patient = patientJpaRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "patientId", patientId));
        List<Appointment> appointments = appointmentService.getAppointments(patient);
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved for patient", appointments));
    }

    @Operation(summary = "Get appointments by date")
    @GetMapping("/by-date/{date}")
    public ResponseEntity<ApiResponse<List<Appointment>>> getAppointmentsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Appointment> appointments = appointmentService.getAppointments(date);
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved for date: " + date, appointments));
    }
}
