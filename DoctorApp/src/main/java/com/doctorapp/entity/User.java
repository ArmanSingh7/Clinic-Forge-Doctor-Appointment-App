package com.doctorapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userId;

    @NotBlank(message = "Username is required")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "Username must contain only letters and numbers")
    @Column(nullable = false, unique = true)
    private String userName;

    @NotBlank(message = "Password is required")
    // No @Size or @Pattern here — this field stores a BCrypt hash, not plain-text.
    // Password complexity is enforced in PatientRegistrationDTO / DoctorRegistrationDTO / AdminRegistrationDTO.
    @Column(nullable = false)
    private String password;

    @NotBlank(message = "Role is required")
    @Column(nullable = false)
    private String role;

    // One-to-One with Patient (Patient owns FK)
    @JsonIgnore
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Patient patient;

    // One-to-One with Admin (Admin owns FK)
    @JsonIgnore
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Admin admin;

    // One-to-One with Doctor (Doctor owns FK)
    @JsonIgnore
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Doctor doctor;
}
