package com.doctorapp.service.impl;

import com.doctorapp.dto.AdminRegistrationDTO;
import com.doctorapp.dto.DoctorRegistrationDTO;
import com.doctorapp.dto.LoginResponseDTO;
import com.doctorapp.dto.PatientRegistrationDTO;
import com.doctorapp.entity.Admin;
import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.PasswordResetToken;
import com.doctorapp.entity.Patient;
import com.doctorapp.entity.User;
import com.doctorapp.exception.InvalidCredentialsException;
import com.doctorapp.repository.IUserRepository;
import com.doctorapp.repository.jpa.AdminJpaRepository;
import com.doctorapp.repository.jpa.DoctorJpaRepository;
import com.doctorapp.repository.jpa.PasswordResetTokenJpaRepository;
import com.doctorapp.repository.jpa.PatientJpaRepository;
import com.doctorapp.repository.jpa.UserJpaRepository;
import com.doctorapp.service.EmailService;
import com.doctorapp.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class UserServiceImpl implements IUserService {

    @Autowired
    private IUserRepository userRepository;

    @Autowired
    private UserJpaRepository userJpaRepository;

    @Autowired
    private DoctorJpaRepository doctorJpaRepository;

    @Autowired
    private PatientJpaRepository patientJpaRepository;

    @Autowired
    private AdminJpaRepository adminJpaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PasswordResetTokenJpaRepository passwordResetTokenJpaRepository;

    @Autowired
    private EmailService emailService;

    @Value("${app.reset-password-url}")
    private String resetPasswordUrl;

    @Override
    @Transactional(readOnly = true)
    public User validateUser(User user) {
        return userRepository.validateUser(user);
    }

    @Override
    @Transactional(readOnly = true)
    public User validateUserByIdentifier(String identifier, String password) {
        // Try username first
        Optional<User> userOpt = userJpaRepository.findByUserName(identifier);

        // Try mobile number in patient table
        if (userOpt.isEmpty()) {
            Optional<Patient> patientOpt = patientJpaRepository.findByMobileNo(identifier);
            if (patientOpt.isPresent()) {
                userOpt = Optional.ofNullable(patientOpt.get().getUser());
            }
        }

        // Try mobile number in doctor table
        if (userOpt.isEmpty()) {
            Optional<Doctor> doctorOpt = doctorJpaRepository.findByMobileNo(identifier);
            if (doctorOpt.isPresent()) {
                userOpt = Optional.ofNullable(doctorOpt.get().getUser());
            }
        }

        User found = userOpt.orElseThrow(() -> new InvalidCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(password, found.getPassword())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        return found;
    }

    @Override
    public User addUser(User user) {
        return userRepository.addUser(user);
    }

    @Override
    public User removeUser(User user) {
        return userRepository.removeUser(user);
    }

    @Override
    public User updateUser(User user) {
        return userRepository.updateUser(user);
    }

    @Override
    public LoginResponseDTO registerDoctor(DoctorRegistrationDTO dto) {
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        User user = new User();
        user.setUserName(dto.getUserName());
        user.setPassword(dto.getPassword());
        user.setRole("DOCTOR");
        User savedUser = userRepository.addUser(user);

        Doctor doctor = new Doctor();
        doctor.setDoctorName(dto.getDoctorName());
        doctor.setSpeciality(dto.getSpeciality());
        doctor.setLocation(dto.getLocation());
        doctor.setHospitalName(dto.getHospitalName());
        doctor.setMobileNo(dto.getMobileNo());
        doctor.setEmail(dto.getEmail());
        doctor.setPassword(passwordEncoder.encode(dto.getPassword()));
        doctor.setChargedPerVisit(dto.getChargedPerVisit());
        doctor.setCity(dto.getCity());
        doctor.setUser(savedUser);
        Doctor savedDoctor = doctorJpaRepository.save(doctor);

        return new LoginResponseDTO(
                savedUser.getUserId(),
                savedUser.getUserName(),
                savedUser.getRole(),
                savedDoctor.getDoctorId(),
                savedDoctor.getDoctorName(),
                null);
    }

    @Override
    public LoginResponseDTO registerPatient(PatientRegistrationDTO dto) {
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        User user = new User();
        user.setUserName(dto.getUserName());
        user.setPassword(dto.getPassword());
        user.setRole("PATIENT");
        User savedUser = userRepository.addUser(user);

        Patient patient = new Patient();
        patient.setPatientName(dto.getPatientName());
        patient.setMobileNo(dto.getMobileNo());
        patient.setEmail(dto.getEmail());
        patient.setPassword(passwordEncoder.encode(dto.getPassword()));
        patient.setBloodGroup(dto.getBloodGroup());
        patient.setGender(dto.getGender());
        patient.setAge(dto.getAge());
        patient.setAddress(dto.getAddress());
        patient.setCity(dto.getCity());
        patient.setUser(savedUser);
        Patient savedPatient = patientJpaRepository.save(patient);

        return new LoginResponseDTO(
                savedUser.getUserId(),
                savedUser.getUserName(),
                savedUser.getRole(),
                savedPatient.getPatientId(),
                savedPatient.getPatientName(),
                null);
    }

    @Override
    public LoginResponseDTO registerAdmin(AdminRegistrationDTO dto) {
        User user = new User();
        user.setUserName(dto.getUserName());
        user.setPassword(dto.getPassword());
        user.setRole("ADMIN");
        User savedUser = userRepository.addUser(user);

        Admin admin = new Admin();
        admin.setAdminName(dto.getAdminName());
        admin.setContactNumber(dto.getContactNumber());
        admin.setEmail(dto.getEmail());
        admin.setPassword(passwordEncoder.encode(dto.getPassword()));
        admin.setUser(savedUser);
        Admin savedAdmin = adminJpaRepository.save(admin);

        return new LoginResponseDTO(
                savedUser.getUserId(),
                savedUser.getUserName(),
                savedUser.getRole(),
                savedAdmin.getAdminId(),
                savedAdmin.getAdminName(),
                null);
    }

    @Override
    public void forgotPassword(String email) {
        // Find user by email across Patient, Doctor, Admin
        User user = null;
        String recipientEmail = email;

        Optional<Patient> patientOpt = patientJpaRepository.findByEmail(email);
        if (patientOpt.isPresent()) {
            user = patientOpt.get().getUser();
        }

        if (user == null) {
            Optional<Doctor> doctorOpt = doctorJpaRepository.findByEmail(email);
            if (doctorOpt.isPresent()) {
                user = doctorOpt.get().getUser();
            }
        }

        if (user == null) {
            Optional<Admin> adminOpt = adminJpaRepository.findByEmail(email);
            if (adminOpt.isPresent()) {
                user = adminOpt.get().getUser();
            }
        }

        if (user == null) {
            throw new IllegalArgumentException("No account found with this email address");
        }

        // Generate token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));
        resetToken.setUsed(false);
        passwordResetTokenJpaRepository.save(resetToken);

        // Send email
        String resetLink = resetPasswordUrl + "?token=" + token;
        emailService.sendPasswordResetEmail(recipientEmail, resetLink);
    }

    @Override
    public void resetPassword(String token, String newPassword, String confirmPassword) {
        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        if (!newPassword.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,20}$")) {
            throw new IllegalArgumentException(
                    "Password must be 8-20 chars with uppercase, lowercase, digit & special character (@$!%*?&#)");
        }

        PasswordResetToken resetToken = passwordResetTokenJpaRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid reset token"));

        if (resetToken.isUsed()) {
            throw new IllegalArgumentException("This reset link has already been used");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("This reset link has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userJpaRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenJpaRepository.save(resetToken);
    }
}
