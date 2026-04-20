package com.doctorapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int patientId;

    @NotBlank(message = "Patient name is required")
    @Column(nullable = false)
    private String patientName;

    @Column
    private String mobileNo;

    @Email(message = "Invalid email format")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Password is required")
    @Column(nullable = false)
    private String password;

    @Column
    private String bloodGroup;

    @Column
    private String gender;

    @Positive(message = "Age must be positive")
    @Column
    private int age;

    @Column
    private String address;

    @Column
    private String city;
    
    //photo base64 encoded
    @Column(columnDefinition = "LONGTEXT")
    private String profilePhoto;

    // One-to-One with User (Patient owns FK)
    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    // One-to-Many with Appointment
    @JsonIgnore
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Appointment> appointments;

    // One-to-Many with Feedback
    @JsonIgnore
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Feedback> feedbacks;
}
