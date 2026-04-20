package com.doctorapp.controller;

import com.doctorapp.dto.AppointmentDTO;
import com.doctorapp.entity.Appointment;
import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Patient;
import com.doctorapp.exception.GlobalExceptionHandler;
import com.doctorapp.exception.ResourceNotFoundException;
import com.doctorapp.repository.jpa.DoctorJpaRepository;
import com.doctorapp.repository.jpa.PatientJpaRepository;
import com.doctorapp.service.IAppointmentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AppointmentControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @InjectMocks
    private AppointmentController appointmentController;

    @Mock
    private IAppointmentService appointmentService;

    @Mock
    private PatientJpaRepository patientJpaRepository;

    @Mock
    private DoctorJpaRepository doctorJpaRepository;

    private Appointment testAppointment;
    private Patient testPatient;
    private Doctor testDoctor;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(appointmentController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        testPatient = new Patient();
        testPatient.setPatientId(1);
        testPatient.setPatientName("John Doe");
        testPatient.setPassword("encoded");

        testDoctor = new Doctor();
        testDoctor.setDoctorId(1);
        testDoctor.setDoctorName("Dr. Smith");
        testDoctor.setPassword("encoded");

        testAppointment = new Appointment();
        testAppointment.setAppointmentId(1);
        testAppointment.setPatient(testPatient);
        testAppointment.setDoctor(testDoctor);
        testAppointment.setAppointmentDate(LocalDate.of(2026, 5, 1));
        testAppointment.setAppointmentStatus("PENDING");
    }

    @Nested
    @DisplayName("GET /api/appointments")
    class GetAppointmentsTests {

        @Test
        @DisplayName("Should get all appointments")
        void shouldGetAllAppointments() throws Exception {
            when(appointmentService.getAllAppointments()).thenReturn(List.of(testAppointment));

            mockMvc.perform(get("/api/appointments"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value(200))
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data[0].appointmentId").value(1));
        }

        @Test
        @DisplayName("Should get appointment by ID")
        void shouldGetAppointmentById() throws Exception {
            when(appointmentService.getAppointment(1)).thenReturn(testAppointment);

            mockMvc.perform(get("/api/appointments/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.appointmentId").value(1))
                    .andExpect(jsonPath("$.data.appointmentStatus").value("PENDING"));
        }
    }

    @Nested
    @DisplayName("POST /api/appointments/book")
    class BookAppointmentTests {

        @Test
        @DisplayName("Should book appointment successfully")
        void shouldBookAppointment() throws Exception {
            AppointmentDTO dto = new AppointmentDTO();
            dto.setPatientId(1);
            dto.setDoctorId(1);
            dto.setAppointmentDate(LocalDate.of(2026, 5, 1));
            dto.setRemark("Checkup");

            when(appointmentService.bookAppointment(any(AppointmentDTO.class)))
                    .thenReturn(testAppointment);

            mockMvc.perform(post("/api/appointments/book")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status").value(201))
                    .andExpect(jsonPath("$.message").value("Appointment booked successfully"));
        }
    }

    @Nested
    @DisplayName("PUT /api/appointments/{id}/status")
    class StatusChangeTests {

        @Test
        @DisplayName("Should approve appointment")
        void shouldApproveAppointment() throws Exception {
            testAppointment.setAppointmentStatus("APPROVED");
            when(appointmentService.approveAppointment(1)).thenReturn(testAppointment);

            mockMvc.perform(put("/api/appointments/1/approve"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Appointment approved"));
        }

        @Test
        @DisplayName("Should reject appointment")
        void shouldRejectAppointment() throws Exception {
            testAppointment.setAppointmentStatus("REJECTED");
            when(appointmentService.rejectAppointment(1)).thenReturn(testAppointment);

            mockMvc.perform(put("/api/appointments/1/reject"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Appointment rejected"));
        }

        @Test
        @DisplayName("Should confirm appointment")
        void shouldConfirmAppointment() throws Exception {
            testAppointment.setAppointmentStatus("CONFIRMED");
            when(appointmentService.confirmAppointment(1)).thenReturn(testAppointment);

            mockMvc.perform(put("/api/appointments/1/confirm"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Appointment confirmed"));
        }

        @Test
        @DisplayName("Should cancel appointment")
        void shouldCancelAppointment() throws Exception {
            testAppointment.setAppointmentStatus("CANCELLED");
            when(appointmentService.cancelAppointment(1)).thenReturn(testAppointment);

            mockMvc.perform(put("/api/appointments/1/cancel"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Appointment cancelled"));
        }
    }

    @Nested
    @DisplayName("GET /api/appointments/by-*")
    class QueryByFilterTests {

        @Test
        @DisplayName("Should get appointments by doctor ID")
        void shouldGetAppointmentsByDoctor() throws Exception {
            when(doctorJpaRepository.findById(1)).thenReturn(Optional.of(testDoctor));
            when(appointmentService.getAppointments(any(Doctor.class))).thenReturn(List.of(testAppointment));

            mockMvc.perform(get("/api/appointments/by-doctor/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray());
        }

        @Test
        @DisplayName("Should return 404 when doctor not found")
        void shouldReturn404WhenDoctorNotFound() throws Exception {
            when(doctorJpaRepository.findById(999)).thenReturn(Optional.empty());

            mockMvc.perform(get("/api/appointments/by-doctor/999"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should get appointments by patient ID")
        void shouldGetAppointmentsByPatient() throws Exception {
            when(patientJpaRepository.findById(1)).thenReturn(Optional.of(testPatient));
            when(appointmentService.getAppointments(any(Patient.class))).thenReturn(List.of(testAppointment));

            mockMvc.perform(get("/api/appointments/by-patient/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray());
        }

        @Test
        @DisplayName("Should get appointments by date")
        void shouldGetAppointmentsByDate() throws Exception {
            when(appointmentService.getAppointments(LocalDate.of(2026, 5, 1)))
                    .thenReturn(List.of(testAppointment));

            mockMvc.perform(get("/api/appointments/by-date/2026-05-01"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray());
        }
    }
}
