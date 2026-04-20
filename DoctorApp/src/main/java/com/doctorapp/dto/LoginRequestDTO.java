package com.doctorapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDTO {

    @NotBlank(message = "Username or mobile number is required")
    private String identifier;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 20, message = "Password must be between 4 and 18 characters")
    private String password;
}
