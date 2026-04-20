package com.doctorapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer doctorId;

    @NotBlank(message = "Doctor name is required")
    @Column(nullable = false)
    private String doctorName;

    @NotBlank(message = "Speciality is required")
    @Column(nullable = false)
    private String speciality;

    @Column
    private String location;

    @Column
    private String city;

    @Column
    private String hospitalName;

    @Column
    private String mobileNo;

    @Email(message = "Invalid email format")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Password is required")
    @Column(nullable = false)
    private String password;

    @Positive(message = "Charge must be positive")
    @Column
    private double chargedPerVisit;
    
    //here the photo is uploaded as Base64 encoded
    @Column(columnDefinition = "LONGTEXT")
    private String profilePhoto;

    // One-to-One with User (Doctor owns FK)
    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    // One-to-Many with Appointment
    @JsonIgnore
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Appointment> appointments;

    // One-to-Many with Feedback
    @JsonIgnore
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Feedback> feedbacks;

    // One-to-Many with AvailabilityDates
    @JsonIgnore
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AvailabilityDates> availabilityDates;

}
