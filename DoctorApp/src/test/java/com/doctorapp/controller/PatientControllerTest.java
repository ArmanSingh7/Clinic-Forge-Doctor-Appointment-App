package com.doctorapp.controller;

import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Patient;
import com.doctorapp.repository.jpa.AppointmentJpaRepository;
import com.doctorapp.repository.jpa.MedicineJpaRepository;
import com.doctorapp.repository.jpa.PatientJpaRepository;
import com.doctorapp.service.IPatientService;
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

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PatientControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private PatientController patientController;

    @Mock
    private IPatientService patientService;

    @Mock
    private AppointmentJpaRepository appointmentJpaRepository;

    @Mock
    private MedicineJpaRepository medicineJpaRepository;

    @Mock
    private PatientJpaRepository patientJpaRepository;

    private Patient testPatient;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(patientController).build();

        testPatient = new Patient();
        testPatient.setPatientId(1);
        testPatient.setPatientName("John Doe");
        testPatient.setMobileNo("9876543210");
        testPatient.setEmail("john@test.com");
        testPatient.setPassword("encoded");
        testPatient.setBloodGroup("O+");
        testPatient.setGender("Male");
        testPatient.setAge(30);
        testPatient.setAddress("123 Main St");
        testPatient.setCity("New York");
    }

    @Nested
    @DisplayName("Patient CRUD Endpoints")
    class PatientCrudEndpointTests {

        @Test
        @DisplayName("POST /api/patients/register - Should register patient")
        void shouldRegisterPatient() throws Exception {
            when(patientService.addPatient(any(Patient.class))).thenReturn(testPatient);

            mockMvc.perform(post("/api/patients/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(testPatient)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status").value(201))
                    .andExpect(jsonPath("$.data.patientName").value("John Doe"));
        }

        @Test
        @DisplayName("PUT /api/patients/update - Should update patient")
        void shouldUpdatePatient() throws Exception {
            testPatient.setCity("Boston");
            when(patientService.updatePatientDetails(any(Patient.class))).thenReturn(testPatient);

            mockMvc.perform(put("/api/patients/update")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(testPatient)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.city").value("Boston"));
        }

        @Test
        @DisplayName("DELETE /api/patients/remove - Should remove patient")
        void shouldRemovePatient() throws Exception {
            when(patientService.removePatientDetails(any(Patient.class))).thenReturn(testPatient);

            mockMvc.perform(delete("/api/patients/remove")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(testPatient)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Patient removed successfully"));
        }

        @Test
        @DisplayName("GET /api/patients/{id} - Should get patient by ID")
        void shouldGetPatientById() throws Exception {
            when(patientService.getPatient(any(Patient.class))).thenReturn(testPatient);

            mockMvc.perform(get("/api/patients/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.patientName").value("John Doe"))
                    .andExpect(jsonPath("$.data.bloodGroup").value("O+"));
        }

        @Test
        @DisplayName("GET /api/patients - Should get all patients")
        void shouldGetAllPatients() throws Exception {
            when(patientService.getAllPatient()).thenReturn(List.of(testPatient));

            mockMvc.perform(get("/api/patients"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data[0].patientName").value("John Doe"));
        }
    }

    @Nested
    @DisplayName("Patient Query Endpoints")
    class PatientQueryEndpointTests {

        @Test
        @DisplayName("GET /api/patients/by-doctor/{id} - Should get patients by doctor")
        void shouldGetPatientsByDoctor() throws Exception {
            when(patientService.getPatientListByDoctor(any(Doctor.class)))
                    .thenReturn(List.of(testPatient));

            mockMvc.perform(get("/api/patients/by-doctor/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray());
        }

        @Test
        @DisplayName("GET /api/patients/by-date/{date} - Should get patients by date")
        void shouldGetPatientsByDate() throws Exception {
            when(patientService.getPatientListByDate(LocalDate.of(2026, 5, 1)))
                    .thenReturn(List.of(testPatient));

            mockMvc.perform(get("/api/patients/by-date/2026-05-01"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray());
        }

        @Test
        @DisplayName("GET /api/patients/{id}/history - Should get patient visit history")
        void shouldGetPatientHistory() throws Exception {
            when(patientService.getPatient(any(Patient.class))).thenReturn(testPatient);
            when(appointmentJpaRepository.findByPatientAndDoctorOrderByAppointmentDateDesc(
                    any(Patient.class), any(Doctor.class))).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/patients/1/history")
                    .param("doctorId", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.patientId").value(1))
                    .andExpect(jsonPath("$.data.patientName").value("John Doe"))
                    .andExpect(jsonPath("$.data.totalVisits").value(0));
        }
    }
}
