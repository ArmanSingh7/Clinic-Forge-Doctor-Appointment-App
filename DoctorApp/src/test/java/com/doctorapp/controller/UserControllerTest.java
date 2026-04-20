package com.doctorapp.controller;

import com.doctorapp.dto.*;
import com.doctorapp.entity.*;
import com.doctorapp.repository.jpa.AdminJpaRepository;
import com.doctorapp.repository.jpa.DoctorJpaRepository;
import com.doctorapp.repository.jpa.PatientJpaRepository;
import com.doctorapp.security.JwtUtil;
import com.doctorapp.service.IUserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private UserController userController;

    @Mock
    private IUserService userService;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private DoctorJpaRepository doctorJpaRepository;

    @Mock
    private PatientJpaRepository patientJpaRepository;

    @Mock
    private AdminJpaRepository adminJpaRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();

        testUser = new User();
        testUser.setUserId(1);
        testUser.setUserName("testuser");
        testUser.setPassword("$2a$10$encoded");
        testUser.setRole("PATIENT");
    }

    @Nested
    @DisplayName("POST /api/users/login")
    class LoginTests {

        @Test
        @DisplayName("Should login patient successfully")
        void shouldLoginPatientSuccessfully() throws Exception {
            Patient patient = new Patient();
            patient.setPatientId(10);
            patient.setPatientName("John Doe");

            when(userService.validateUserByIdentifier("testuser", "Password@1")).thenReturn(testUser);
            when(patientJpaRepository.findByUser(testUser)).thenReturn(Optional.of(patient));
            when(jwtUtil.generateToken(eq(1), eq("testuser"), eq("PATIENT"), eq(10)))
                    .thenReturn("jwt-token-123");

            LoginRequestDTO request = new LoginRequestDTO("testuser", "Password@1");

            mockMvc.perform(post("/api/users/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value(200))
                    .andExpect(jsonPath("$.message").value("Login successful"))
                    .andExpect(jsonPath("$.data.userName").value("testuser"))
                    .andExpect(jsonPath("$.data.role").value("PATIENT"))
                    .andExpect(jsonPath("$.data.token").value("jwt-token-123"));
        }

        @Test
        @DisplayName("Should login doctor and auto-link by email")
        void shouldLoginDoctorAndAutoLink() throws Exception {
            User doctorUser = new User();
            doctorUser.setUserId(2);
            doctorUser.setUserName("docuser");
            doctorUser.setPassword("$2a$10$encoded");
            doctorUser.setRole("DOCTOR");

            Doctor doctor = new Doctor();
            doctor.setDoctorId(5);
            doctor.setDoctorName("Dr. Smith");
            doctor.setUser(null); // unlinked

            when(userService.validateUserByIdentifier("docuser", "Password@1")).thenReturn(doctorUser);
            when(doctorJpaRepository.findByUser(doctorUser)).thenReturn(Optional.empty());
            when(doctorJpaRepository.findByEmail("docuser")).thenReturn(Optional.of(doctor));
            when(doctorJpaRepository.save(any(Doctor.class))).thenReturn(doctor);
            when(jwtUtil.generateToken(anyInt(), anyString(), anyString(), any()))
                    .thenReturn("jwt-token-doc");

            LoginRequestDTO request = new LoginRequestDTO("docuser", "Password@1");

            mockMvc.perform(post("/api/users/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.role").value("DOCTOR"))
                    .andExpect(jsonPath("$.data.profileId").value(5));
        }
    }

    @Nested
    @DisplayName("POST /api/users/register/*")
    class RegistrationTests {

        @Test
        @DisplayName("Should register doctor successfully")
        void shouldRegisterDoctor() throws Exception {
            DoctorRegistrationDTO dto = new DoctorRegistrationDTO();
            dto.setUserName("newdoc");
            dto.setPassword("Password@1");
            dto.setConfirmPassword("Password@1");
            dto.setDoctorName("Dr. New");
            dto.setSpeciality("Dermatology");
            dto.setEmail("newdoc@test.com");
            dto.setChargedPerVisit(300.0);

            LoginResponseDTO response = new LoginResponseDTO(1, "newdoc", "DOCTOR", 1, "Dr. New", null);
            when(userService.registerDoctor(any(DoctorRegistrationDTO.class))).thenReturn(response);

            mockMvc.perform(post("/api/users/register/doctor")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status").value(201))
                    .andExpect(jsonPath("$.data.role").value("DOCTOR"));
        }

        @Test
        @DisplayName("Should register patient successfully")
        void shouldRegisterPatient() throws Exception {
            PatientRegistrationDTO dto = new PatientRegistrationDTO();
            dto.setUserName("newpat");
            dto.setPassword("Password@1");
            dto.setConfirmPassword("Password@1");
            dto.setPatientName("New Patient");
            dto.setEmail("newpat@test.com");
            dto.setAge(25);

            LoginResponseDTO response = new LoginResponseDTO(1, "newpat", "PATIENT", 1, "New Patient", null);
            when(userService.registerPatient(any(PatientRegistrationDTO.class))).thenReturn(response);

            mockMvc.perform(post("/api/users/register/patient")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.role").value("PATIENT"));
        }

        @Test
        @DisplayName("Should register admin successfully")
        void shouldRegisterAdmin() throws Exception {
            AdminRegistrationDTO dto = new AdminRegistrationDTO();
            dto.setUserName("newadmin");
            dto.setPassword("Password@1");
            dto.setAdminName("New Admin");
            dto.setEmail("newadmin@test.com");

            LoginResponseDTO response = new LoginResponseDTO(1, "newadmin", "ADMIN", 1, "New Admin", null);
            when(userService.registerAdmin(any(AdminRegistrationDTO.class))).thenReturn(response);

            mockMvc.perform(post("/api/users/register/admin")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.role").value("ADMIN"));
        }
    }
}
