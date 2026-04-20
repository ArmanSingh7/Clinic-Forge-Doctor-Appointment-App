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
public class DoctorRegistrationDTO {

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

    @NotBlank(message = "Doctor name is required")
    private String doctorName;

    @NotBlank(message = "Speciality is required")
    private String speciality;

    private String location;

    private String hospitalName;

    private String mobileNo;

    @Email(message = "Invalid email format")
    private String email;

    @Positive(message = "Charge must be positive")
    private double chargedPerVisit;

    private String city;
}
