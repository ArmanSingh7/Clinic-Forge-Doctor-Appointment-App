package com.doctorapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "admins")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int adminId;

    @NotBlank(message = "Admin name is required")
    @Column(nullable = false)
    private String adminName;

    @Column
    private String contactNumber;

    @Email(message = "Invalid email format")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Password is required")
    @Column(nullable = false)
    private String password;

    // One-to-One with User (Admin owns FK)
    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;
}
