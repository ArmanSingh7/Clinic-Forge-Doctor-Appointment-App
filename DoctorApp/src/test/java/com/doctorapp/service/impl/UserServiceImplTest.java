package com.doctorapp.service.impl;

import com.doctorapp.dto.AdminRegistrationDTO;
import com.doctorapp.dto.DoctorRegistrationDTO;
import com.doctorapp.dto.LoginResponseDTO;
import com.doctorapp.dto.PatientRegistrationDTO;
import com.doctorapp.entity.Admin;
import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Patient;
import com.doctorapp.entity.User;
import com.doctorapp.exception.InvalidCredentialsException;
import com.doctorapp.repository.IUserRepository;
import com.doctorapp.repository.jpa.AdminJpaRepository;
import com.doctorapp.repository.jpa.DoctorJpaRepository;
import com.doctorapp.repository.jpa.PatientJpaRepository;
import com.doctorapp.repository.jpa.UserJpaRepository;
import com.doctorapp.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @InjectMocks
    private UserServiceImpl userService;

    @Mock
    private IUserRepository userRepository;

    @Mock
    private UserJpaRepository userJpaRepository;

    @Mock
    private DoctorJpaRepository doctorJpaRepository;

    @Mock
    private PatientJpaRepository patientJpaRepository;

    @Mock
    private AdminJpaRepository adminJpaRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUserId(1);
        testUser.setUserName("testuser");
        testUser.setPassword("$2a$10$encodedPassword");
        testUser.setRole("PATIENT");
    }

    // ======================================================
    // LOGIN MODULE TESTS
    // ======================================================

    @Nested
    @DisplayName("Login - validateUserByIdentifier")
    class ValidateUserByIdentifierTests {

        @Test
        @DisplayName("Should login successfully with valid username and password")
        void shouldLoginWithValidCredentials() {
            when(userJpaRepository.findByUserName("testuser")).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("Password@1", testUser.getPassword())).thenReturn(true);

            User result = userService.validateUserByIdentifier("testuser", "Password@1");

            assertThat(result).isNotNull();
            assertThat(result.getUserName()).isEqualTo("testuser");
            verify(userJpaRepository).findByUserName("testuser");
        }

        @Test
        @DisplayName("Should login with mobile number (patient)")
        void shouldLoginWithPatientMobileNumber() {
            Patient patient = new Patient();
            patient.setPatientId(1);
            patient.setUser(testUser);

            when(userJpaRepository.findByUserName("9876543210")).thenReturn(Optional.empty());
            when(patientJpaRepository.findByMobileNo("9876543210")).thenReturn(Optional.of(patient));
            when(passwordEncoder.matches("Password@1", testUser.getPassword())).thenReturn(true);

            User result = userService.validateUserByIdentifier("9876543210", "Password@1");

            assertThat(result).isNotNull();
            assertThat(result.getUserId()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should login with mobile number (doctor)")
        void shouldLoginWithDoctorMobileNumber() {
            User doctorUser = new User();
            doctorUser.setUserId(2);
            doctorUser.setUserName("docuser");
            doctorUser.setPassword("$2a$10$encodedPassword");
            doctorUser.setRole("DOCTOR");

            Doctor doctor = new Doctor();
            doctor.setDoctorId(1);
            doctor.setUser(doctorUser);

            when(userJpaRepository.findByUserName("9876543210")).thenReturn(Optional.empty());
            when(patientJpaRepository.findByMobileNo("9876543210")).thenReturn(Optional.empty());
            when(doctorJpaRepository.findByMobileNo("9876543210")).thenReturn(Optional.of(doctor));
            when(passwordEncoder.matches("Password@1", doctorUser.getPassword())).thenReturn(true);

            User result = userService.validateUserByIdentifier("9876543210", "Password@1");

            assertThat(result).isNotNull();
            assertThat(result.getRole()).isEqualTo("DOCTOR");
        }

        @Test
        @DisplayName("Should throw InvalidCredentialsException for unknown user")
        void shouldThrowExceptionForUnknownUser() {
            when(userJpaRepository.findByUserName("unknown")).thenReturn(Optional.empty());
            when(patientJpaRepository.findByMobileNo("unknown")).thenReturn(Optional.empty());
            when(doctorJpaRepository.findByMobileNo("unknown")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.validateUserByIdentifier("unknown", "Password@1"))
                    .isInstanceOf(InvalidCredentialsException.class)
                    .hasMessage("Invalid username or password");
        }

        @Test
        @DisplayName("Should throw InvalidCredentialsException for wrong password")
        void shouldThrowExceptionForWrongPassword() {
            when(userJpaRepository.findByUserName("testuser")).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("wrongpassword", testUser.getPassword())).thenReturn(false);

            assertThatThrownBy(() -> userService.validateUserByIdentifier("testuser", "wrongpassword"))
                    .isInstanceOf(InvalidCredentialsException.class)
                    .hasMessage("Invalid username or password");
        }
    }

    @Nested
    @DisplayName("Login - User CRUD")
    class UserCrudTests {

        @Test
        @DisplayName("Should add a new user")
        void shouldAddUser() {
            when(userRepository.addUser(any(User.class))).thenReturn(testUser);

            User result = userService.addUser(testUser);

            assertThat(result).isNotNull();
            assertThat(result.getUserName()).isEqualTo("testuser");
            verify(userRepository).addUser(testUser);
        }

        @Test
        @DisplayName("Should update existing user")
        void shouldUpdateUser() {
            testUser.setRole("ADMIN");
            when(userRepository.updateUser(any(User.class))).thenReturn(testUser);

            User result = userService.updateUser(testUser);

            assertThat(result.getRole()).isEqualTo("ADMIN");
            verify(userRepository).updateUser(testUser);
        }

        @Test
        @DisplayName("Should remove user")
        void shouldRemoveUser() {
            when(userRepository.removeUser(any(User.class))).thenReturn(testUser);

            User result = userService.removeUser(testUser);

            assertThat(result).isNotNull();
            verify(userRepository).removeUser(testUser);
        }
    }

    @Nested
    @DisplayName("Login - Register Doctor")
    class RegisterDoctorTests {

        @Test
        @DisplayName("Should register doctor successfully")
        void shouldRegisterDoctor() {
            DoctorRegistrationDTO dto = new DoctorRegistrationDTO();
            dto.setUserName("docuser");
            dto.setPassword("Password@1");
            dto.setConfirmPassword("Password@1");
            dto.setDoctorName("Dr. Smith");
            dto.setSpeciality("Cardiology");
            dto.setLocation("New York");
            dto.setHospitalName("City Hospital");
            dto.setMobileNo("9876543210");
            dto.setEmail("dr.smith@test.com");
            dto.setChargedPerVisit(500.0);
            dto.setCity("New York");

            User savedUser = new User();
            savedUser.setUserId(1);
            savedUser.setUserName("docuser");
            savedUser.setRole("DOCTOR");

            Doctor savedDoctor = new Doctor();
            savedDoctor.setDoctorId(1);
            savedDoctor.setDoctorName("Dr. Smith");

            when(userRepository.addUser(any(User.class))).thenReturn(savedUser);
            when(passwordEncoder.encode("Password@1")).thenReturn("$2a$10$encoded");
            when(doctorJpaRepository.save(any(Doctor.class))).thenReturn(savedDoctor);

            LoginResponseDTO result = userService.registerDoctor(dto);

            assertThat(result).isNotNull();
            assertThat(result.getUserName()).isEqualTo("docuser");
            assertThat(result.getRole()).isEqualTo("DOCTOR");
            assertThat(result.getProfileId()).isEqualTo(1);
            assertThat(result.getProfileName()).isEqualTo("Dr. Smith");
            verify(userRepository).addUser(any(User.class));
            verify(doctorJpaRepository).save(any(Doctor.class));
        }

        @Test
        @DisplayName("Should throw exception when passwords don't match")
        void shouldThrowExceptionWhenPasswordsMismatch() {
            DoctorRegistrationDTO dto = new DoctorRegistrationDTO();
            dto.setPassword("Password@1");
            dto.setConfirmPassword("DifferentPassword@1");

            assertThatThrownBy(() -> userService.registerDoctor(dto))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Passwords do not match");
        }
    }

    @Nested
    @DisplayName("Login - Register Patient")
    class RegisterPatientTests {

        @Test
        @DisplayName("Should register patient successfully")
        void shouldRegisterPatient() {
            PatientRegistrationDTO dto = new PatientRegistrationDTO();
            dto.setUserName("patuser");
            dto.setPassword("Password@1");
            dto.setConfirmPassword("Password@1");
            dto.setPatientName("John Doe");
            dto.setMobileNo("9876543210");
            dto.setEmail("john@test.com");
            dto.setBloodGroup("O+");
            dto.setGender("Male");
            dto.setAge(30);
            dto.setAddress("123 Main St");
            dto.setCity("New York");

            User savedUser = new User();
            savedUser.setUserId(1);
            savedUser.setUserName("patuser");
            savedUser.setRole("PATIENT");

            Patient savedPatient = new Patient();
            savedPatient.setPatientId(1);
            savedPatient.setPatientName("John Doe");

            when(userRepository.addUser(any(User.class))).thenReturn(savedUser);
            when(passwordEncoder.encode("Password@1")).thenReturn("$2a$10$encoded");
            when(patientJpaRepository.save(any(Patient.class))).thenReturn(savedPatient);

            LoginResponseDTO result = userService.registerPatient(dto);

            assertThat(result).isNotNull();
            assertThat(result.getUserName()).isEqualTo("patuser");
            assertThat(result.getRole()).isEqualTo("PATIENT");
            assertThat(result.getProfileName()).isEqualTo("John Doe");
        }

        @Test
        @DisplayName("Should throw exception when patient passwords don't match")
        void shouldThrowExceptionWhenPasswordsMismatch() {
            PatientRegistrationDTO dto = new PatientRegistrationDTO();
            dto.setPassword("Password@1");
            dto.setConfirmPassword("DifferentPassword@1");

            assertThatThrownBy(() -> userService.registerPatient(dto))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Passwords do not match");
        }
    }

    @Nested
    @DisplayName("Login - Register Admin")
    class RegisterAdminTests {

        @Test
        @DisplayName("Should register admin successfully")
        void shouldRegisterAdmin() {
            AdminRegistrationDTO dto = new AdminRegistrationDTO();
            dto.setUserName("adminuser");
            dto.setPassword("Password@1");
            dto.setAdminName("Super Admin");
            dto.setContactNumber("9876543210");
            dto.setEmail("admin@test.com");

            User savedUser = new User();
            savedUser.setUserId(1);
            savedUser.setUserName("adminuser");
            savedUser.setRole("ADMIN");

            Admin savedAdmin = new Admin();
            savedAdmin.setAdminId(1);
            savedAdmin.setAdminName("Super Admin");

            when(userRepository.addUser(any(User.class))).thenReturn(savedUser);
            when(passwordEncoder.encode("Password@1")).thenReturn("$2a$10$encoded");
            when(adminJpaRepository.save(any(Admin.class))).thenReturn(savedAdmin);

            LoginResponseDTO result = userService.registerAdmin(dto);

            assertThat(result).isNotNull();
            assertThat(result.getRole()).isEqualTo("ADMIN");
            assertThat(result.getProfileName()).isEqualTo("Super Admin");
        }
    }
}
