package com.doctorapp.controller;

import com.doctorapp.dto.AdminRegistrationDTO;
import com.doctorapp.dto.ApiResponse;
import com.doctorapp.dto.DoctorRegistrationDTO;
import com.doctorapp.dto.LoginRequestDTO;
import com.doctorapp.dto.LoginResponseDTO;
import com.doctorapp.dto.PatientRegistrationDTO;
import com.doctorapp.entity.Admin;
import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Patient;
import com.doctorapp.entity.User;
import com.doctorapp.repository.jpa.AdminJpaRepository;
import com.doctorapp.repository.jpa.DoctorJpaRepository;
import com.doctorapp.repository.jpa.PatientJpaRepository;
import com.doctorapp.security.JwtUtil;
import com.doctorapp.service.IUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Login Module", description = "User registration and authentication")
public class UserController {

    @Autowired
    private IUserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private DoctorJpaRepository doctorJpaRepository;

    @Autowired
    private PatientJpaRepository patientJpaRepository;

    @Autowired
    private AdminJpaRepository adminJpaRepository;

    @Operation(summary = "Validate / Login user")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        User validated = userService.validateUserByIdentifier(
                loginRequest.getIdentifier(), loginRequest.getPassword());

        LoginResponseDTO response = new LoginResponseDTO();
        response.setUserId(validated.getUserId());
        response.setUserName(validated.getUserName());
        response.setRole(validated.getRole());

        switch (validated.getRole().toUpperCase()) {
            case "DOCTOR":
                // Try by user link first
                Optional<Doctor> doctorOpt = doctorJpaRepository.findByUser(validated);
                // Fallback: match by email if doctor was added by admin without user link
                if (doctorOpt.isEmpty()) {
                    doctorOpt = doctorJpaRepository.findByEmail(validated.getUserName());
                }
                // If found unlinked, auto-link the doctor to this user
                if (doctorOpt.isPresent()) {
                    Doctor doctor = doctorOpt.get();
                    if (doctor.getUser() == null) {
                        doctor.setUser(validated);
                        doctorJpaRepository.save(doctor);
                    }
                    response.setProfileId(doctor.getDoctorId());
                    response.setProfileName(doctor.getDoctorName());
                }
                break;
            case "PATIENT":
                Optional<Patient> patientOpt = patientJpaRepository.findByUser(validated);
                if (patientOpt.isEmpty()) {
                    patientOpt = patientJpaRepository.findByEmail(validated.getUserName());
                }
                if (patientOpt.isPresent()) {
                    Patient patient = patientOpt.get();
                    if (patient.getUser() == null) {
                        patient.setUser(validated);
                        patientJpaRepository.save(patient);
                    }
                    response.setProfileId(patient.getPatientId());
                    response.setProfileName(patient.getPatientName());
                }
                break;
            case "ADMIN":
                adminJpaRepository.findByUser(validated).ifPresent(admin -> {
                    response.setProfileId(admin.getAdminId());
                    response.setProfileName(admin.getAdminName());
                });
                break;
        }

        String token = jwtUtil.generateToken(
                response.getUserId(), response.getUserName(),
                response.getRole(), response.getProfileId());
        response.setToken(token);

        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @Operation(summary = "Register a new user")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody User user) {
        User created = userService.addUser(user);
        return new ResponseEntity<>(ApiResponse.created("User registered successfully", created), HttpStatus.CREATED);
    }

    @Operation(summary = "Register a new doctor")
    @PostMapping("/register/doctor")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> registerDoctor(@Valid @RequestBody DoctorRegistrationDTO dto) {
        LoginResponseDTO response = userService.registerDoctor(dto);
        return new ResponseEntity<>(ApiResponse.created("Doctor registered successfully", response),
                HttpStatus.CREATED);
    }

    @Operation(summary = "Register a new patient")
    @PostMapping("/register/patient")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> registerPatient(
            @Valid @RequestBody PatientRegistrationDTO dto) {
        LoginResponseDTO response = userService.registerPatient(dto);
        return new ResponseEntity<>(ApiResponse.created("Patient registered successfully", response),
                HttpStatus.CREATED);
    }

    @Operation(summary = "Register a new admin")
    @PostMapping("/register/admin")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> registerAdmin(@Valid @RequestBody AdminRegistrationDTO dto) {
        LoginResponseDTO response = userService.registerAdmin(dto);
        return new ResponseEntity<>(ApiResponse.created("Admin registered successfully", response), HttpStatus.CREATED);
    }

    @Operation(summary = "Update existing user")
    @PutMapping("/update")
    public ResponseEntity<ApiResponse<User>> update(@Valid @RequestBody User user) {
        User updated = userService.updateUser(user);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updated));
    }

    @Operation(summary = "Remove a user")
    @DeleteMapping("/remove")
    public ResponseEntity<ApiResponse<User>> remove(@RequestBody User user) {
        User removed = userService.removeUser(user);
        return ResponseEntity.ok(ApiResponse.deleted("User removed successfully", removed));
    }

    @Operation(summary = "Request password reset email")
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email is required"));
        }
        try {
            userService.forgotPassword(email.trim());
            return ResponseEntity.ok(ApiResponse.success("Password reset link sent to your email", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to send reset email. Please try again later."));
        }
    }

    @Operation(summary = "Reset password using token")
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody java.util.Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");

        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Reset token is required"));
        }
        try {
            userService.resetPassword(token.trim(), newPassword, confirmPassword);
            return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
