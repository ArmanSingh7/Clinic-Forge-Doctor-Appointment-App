package com.doctorapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientRegistrationDTO {

    @NotBlank(message = "Username is required")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "Username must contain only letters and numbers")
    private String userName;

    @NotBlank(message = "Password is required")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,20}$",
        message = "Password must be 8-20 characters and contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&#)"
    )
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    @NotBlank(message = "Patient name is required")
    private String patientName;

    private String mobileNo;

    @Email(message = "Invalid email format")
    private String email;

    private String bloodGroup;

    private String gender;

    @Positive(message = "Age must be positive")
    private int age;

    private String address;

    private String city;
}
