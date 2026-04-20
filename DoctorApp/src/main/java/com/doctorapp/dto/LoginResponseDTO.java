package com.doctorapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {

    private int userId;
    private String userName;
    private String role;
    private Integer profileId;
    private String profileName;
    private String token;
}
