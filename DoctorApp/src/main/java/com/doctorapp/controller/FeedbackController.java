package com.doctorapp.controller;

import com.doctorapp.dto.ApiResponse;
import com.doctorapp.entity.Appointment;
import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Feedback;
import com.doctorapp.entity.TimeSlot;
import com.doctorapp.exception.ResourceNotFoundException;
import com.doctorapp.repository.jpa.AppointmentJpaRepository;
import com.doctorapp.repository.jpa.DoctorJpaRepository;
import com.doctorapp.service.IFeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/feedbacks")
@Tag(name = "Feedback Module", description = "Patient feedback for doctors")
public class FeedbackController {

    @Autowired
    private IFeedbackService feedbackService;

    @Autowired
    private DoctorJpaRepository doctorJpaRepository;

    @Autowired
    private AppointmentJpaRepository appointmentJpaRepository;

    @Operation(summary = "Submit feedback for a doctor")
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<Feedback>> addFeedback(@RequestBody Feedback feedback) {
        // Feedback must be tied to an appointment
        if (feedback.getAppointment() == null || feedback.getAppointment().getAppointmentId() <= 0) {
            return new ResponseEntity<>(ApiResponse.error("Feedback must be linked to an appointment"),
                    HttpStatus.BAD_REQUEST);
        }

        // Load the actual appointment from DB
        Appointment appointment = appointmentJpaRepository.findById(feedback.getAppointment().getAppointmentId())
                .orElse(null);
        if (appointment == null) {
            return new ResponseEntity<>(ApiResponse.error("Appointment not found"),
                    HttpStatus.NOT_FOUND);
        }

        // Only CONFIRMED appointments are eligible for feedback
        if (!"CONFIRMED".equals(appointment.getAppointmentStatus())) {
            return new ResponseEntity<>(ApiResponse.error("Feedback can only be given for confirmed appointments"),
                    HttpStatus.BAD_REQUEST);
        }

        // The appointment time must have passed
        LocalDate today = LocalDate.now();
        if (appointment.getAppointmentDate().isAfter(today)) {
            return new ResponseEntity<>(ApiResponse.error("Feedback can only be given after the appointment is completed"),
                    HttpStatus.BAD_REQUEST);
        }
        if (appointment.getAppointmentDate().isEqual(today)) {
            TimeSlot slot = appointment.getTimeSlot();
            if (slot != null && slot.getEndTime() != null && LocalTime.now().isBefore(slot.getEndTime())) {
                return new ResponseEntity<>(ApiResponse.error("Feedback can only be given after the appointment time has ended"),
                        HttpStatus.BAD_REQUEST);
            }
        }

        // Check if feedback already exists for this appointment
        Optional<Feedback> existing = feedbackService
                .getFeedbackByAppointment(feedback.getAppointment().getAppointmentId());
        if (existing.isPresent()) {
            return new ResponseEntity<>(ApiResponse.error("Feedback already submitted for this appointment"),
                    HttpStatus.CONFLICT);
        }

        Feedback created = feedbackService.addFeedback(feedback);
        return new ResponseEntity<>(ApiResponse.created("Feedback submitted successfully", created),
                HttpStatus.CREATED);
    }

    @Operation(summary = "Get feedback by ID")
    @GetMapping("/{feedbackId}")
    public ResponseEntity<ApiResponse<Feedback>> getFeedback(@PathVariable int feedbackId) {
        Feedback probe = new Feedback();
        probe.setFeedbackId(feedbackId);
        Feedback found = feedbackService.getFeedback(probe);
        return ResponseEntity.ok(ApiResponse.success("Feedback retrieved successfully", found));
    }

    @Operation(summary = "Get all feedbacks for a doctor")
    @GetMapping("/by-doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<Feedback>>> getAllFeedbacksByDoctor(@PathVariable int doctorId) {
        Doctor doctor = doctorJpaRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "doctorId", doctorId));
        List<Feedback> feedbacks = feedbackService.getAllFeedbacks(doctor);
        return ResponseEntity.ok(ApiResponse.success("Feedbacks retrieved for doctor", feedbacks));
    }

    @Operation(summary = "Get feedback for a specific appointment")
    @GetMapping("/by-appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<Feedback>> getFeedbackByAppointment(@PathVariable int appointmentId) {
        Optional<Feedback> feedback = feedbackService.getFeedbackByAppointment(appointmentId);
        if (feedback.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("Feedback found for appointment", feedback.get()));
        }
        return ResponseEntity.ok(ApiResponse.success("No feedback for this appointment", null));
    }
}
