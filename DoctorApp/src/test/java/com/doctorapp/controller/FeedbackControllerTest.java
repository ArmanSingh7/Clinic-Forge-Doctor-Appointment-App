package com.doctorapp.controller;

import com.doctorapp.entity.*;
import com.doctorapp.exception.GlobalExceptionHandler;
import com.doctorapp.exception.ResourceNotFoundException;
import com.doctorapp.repository.jpa.DoctorJpaRepository;
import com.doctorapp.service.IFeedbackService;
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

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class FeedbackControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private FeedbackController feedbackController;

    @Mock
    private IFeedbackService feedbackService;

    @Mock
    private DoctorJpaRepository doctorJpaRepository;

    private Feedback testFeedback;
    private Doctor testDoctor;
    private Patient testPatient;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(feedbackController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        testDoctor = new Doctor();
        testDoctor.setDoctorId(1);
        testDoctor.setDoctorName("Dr. Smith");
        testDoctor.setPassword("encoded");

        testPatient = new Patient();
        testPatient.setPatientId(1);
        testPatient.setPatientName("John Doe");
        testPatient.setPassword("encoded");

        Appointment appointment = new Appointment();
        appointment.setAppointmentId(1);

        testFeedback = new Feedback();
        testFeedback.setFeedbackId(1);
        testFeedback.setRating(5);
        testFeedback.setFeedbackComment("Excellent!");
        testFeedback.setDoctor(testDoctor);
        testFeedback.setPatient(testPatient);
        testFeedback.setAppointment(appointment);
    }

    @Nested
    @DisplayName("POST /api/feedbacks/add")
    class AddFeedbackTests {

        @Test
        @DisplayName("Should add feedback successfully")
        void shouldAddFeedbackSuccessfully() throws Exception {
            when(feedbackService.getFeedbackByAppointment(1)).thenReturn(Optional.empty());
            when(feedbackService.addFeedback(any(Feedback.class))).thenReturn(testFeedback);

            mockMvc.perform(post("/api/feedbacks/add")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(testFeedback)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status").value(201))
                    .andExpect(jsonPath("$.data.rating").value(5))
                    .andExpect(jsonPath("$.data.feedbackComment").value("Excellent!"));
        }

        @Test
        @DisplayName("Should return 409 when feedback already exists for appointment")
        void shouldReturn409WhenFeedbackAlreadyExists() throws Exception {
            when(feedbackService.getFeedbackByAppointment(1)).thenReturn(Optional.of(testFeedback));

            mockMvc.perform(post("/api/feedbacks/add")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(testFeedback)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.message").value("Feedback already submitted for this appointment"));
        }
    }

    @Nested
    @DisplayName("GET /api/feedbacks/*")
    class GetFeedbackTests {

        @Test
        @DisplayName("Should get feedback by ID")
        void shouldGetFeedbackById() throws Exception {
            when(feedbackService.getFeedback(any(Feedback.class))).thenReturn(testFeedback);

            mockMvc.perform(get("/api/feedbacks/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.feedbackId").value(1))
                    .andExpect(jsonPath("$.data.rating").value(5));
        }

        @Test
        @DisplayName("Should get feedbacks by doctor ID")
        void shouldGetFeedbacksByDoctorId() throws Exception {
            when(doctorJpaRepository.findById(1)).thenReturn(Optional.of(testDoctor));
            when(feedbackService.getAllFeedbacks(any(Doctor.class))).thenReturn(List.of(testFeedback));

            mockMvc.perform(get("/api/feedbacks/by-doctor/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data[0].rating").value(5));
        }

        @Test
        @DisplayName("Should return 404 when doctor not found for feedbacks")
        void shouldReturn404WhenDoctorNotFound() throws Exception {
            when(doctorJpaRepository.findById(999)).thenReturn(Optional.empty());

            mockMvc.perform(get("/api/feedbacks/by-doctor/999"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should get feedback by appointment ID")
        void shouldGetFeedbackByAppointmentId() throws Exception {
            when(feedbackService.getFeedbackByAppointment(1)).thenReturn(Optional.of(testFeedback));

            mockMvc.perform(get("/api/feedbacks/by-appointment/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.rating").value(5));
        }

        @Test
        @DisplayName("Should return null data when no feedback for appointment")
        void shouldReturnNullDataWhenNoFeedback() throws Exception {
            when(feedbackService.getFeedbackByAppointment(999)).thenReturn(Optional.empty());

            mockMvc.perform(get("/api/feedbacks/by-appointment/999"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").doesNotExist());
        }
    }
}
