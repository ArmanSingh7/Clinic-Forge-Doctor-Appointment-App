package com.doctorapp.service;

import com.doctorapp.dto.AdminRegistrationDTO;
import com.doctorapp.dto.DoctorRegistrationDTO;
import com.doctorapp.dto.LoginResponseDTO;
import com.doctorapp.dto.PatientRegistrationDTO;
import com.doctorapp.entity.User;

public interface IUserService {

    User validateUser(User user);

    User validateUserByIdentifier(String identifier, String password);

    User addUser(User user);

    User removeUser(User user);

    User updateUser(User user);

    LoginResponseDTO registerDoctor(DoctorRegistrationDTO dto);

    LoginResponseDTO registerPatient(PatientRegistrationDTO dto);

    LoginResponseDTO registerAdmin(AdminRegistrationDTO dto);

    void forgotPassword(String email);

    void resetPassword(String token, String newPassword, String confirmPassword);
}
