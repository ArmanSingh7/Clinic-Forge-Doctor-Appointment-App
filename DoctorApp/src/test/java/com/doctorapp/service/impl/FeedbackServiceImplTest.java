package com.doctorapp.service.impl;

import com.doctorapp.entity.*;
import com.doctorapp.repository.IFeedbackRepository;
import com.doctorapp.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FeedbackServiceImplTest {

    @InjectMocks
    private FeedbackServiceImpl feedbackService;

    @Mock
    private IFeedbackRepository feedbackRepository;

    @Mock
    private NotificationService notificationService;

    private Feedback testFeedback;
    private Doctor testDoctor;
    private Patient testPatient;
    private User doctorUser;

    @BeforeEach
    void setUp() {
        doctorUser = new User();
        doctorUser.setUserId(2);
        doctorUser.setUserName("doctoruser");
        doctorUser.setRole("DOCTOR");

        testDoctor = new Doctor();
        testDoctor.setDoctorId(1);
        testDoctor.setDoctorName("Dr. Smith");
        testDoctor.setUser(doctorUser);

        testPatient = new Patient();
        testPatient.setPatientId(1);
        testPatient.setPatientName("John Doe");

        Appointment appointment = new Appointment();
        appointment.setAppointmentId(1);

        testFeedback = new Feedback();
        testFeedback.setFeedbackId(1);
        testFeedback.setRating(5);
        testFeedback.setFeedbackComment("Excellent doctor!");
        testFeedback.setDoctor(testDoctor);
        testFeedback.setPatient(testPatient);
        testFeedback.setAppointment(appointment);
    }

    // ======================================================
    // ADD FEEDBACK TESTS
    // ======================================================

    @Nested
    @DisplayName("Add Feedback")
    class AddFeedbackTests {

        @Test
        @DisplayName("Should add feedback and notify doctor")
        void shouldAddFeedbackAndNotifyDoctor() {
            when(feedbackRepository.addFeedback(any(Feedback.class))).thenReturn(testFeedback);

            Feedback result = feedbackService.addFeedback(testFeedback);

            assertThat(result).isNotNull();
            assertThat(result.getRating()).isEqualTo(5);
            assertThat(result.getFeedbackComment()).isEqualTo("Excellent doctor!");
            verify(feedbackRepository).addFeedback(testFeedback);
            verify(notificationService).createNotification(
                    eq(2), eq("New Feedback Received"),
                    contains("5★"), eq("FEEDBACK_RECEIVED"), eq(1L));
        }

        @Test
        @DisplayName("Should add feedback without notification if doctor has no user")
        void shouldAddFeedbackWithoutNotificationIfDoctorHasNoUser() {
            testDoctor.setUser(null);
            when(feedbackRepository.addFeedback(any(Feedback.class))).thenReturn(testFeedback);

            Feedback result = feedbackService.addFeedback(testFeedback);

            assertThat(result).isNotNull();
            verify(notificationService, never()).createNotification(anyInt(), anyString(),
                    anyString(), anyString(), anyLong());
        }

        @Test
        @DisplayName("Should add feedback with null patient name gracefully")
        void shouldAddFeedbackWithNullPatient() {
            testFeedback.setPatient(null);
            when(feedbackRepository.addFeedback(any(Feedback.class))).thenReturn(testFeedback);

            Feedback result = feedbackService.addFeedback(testFeedback);

            assertThat(result).isNotNull();
            verify(notificationService).createNotification(
                    eq(2), eq("New Feedback Received"),
                    contains("A patient"), eq("FEEDBACK_RECEIVED"), eq(1L));
        }
    }

    // ======================================================
    // GET FEEDBACK TESTS
    // ======================================================

    @Nested
    @DisplayName("Get Feedback")
    class GetFeedbackTests {

        @Test
        @DisplayName("Should get feedback by probe")
        void shouldGetFeedback() {
            Feedback probe = new Feedback();
            probe.setFeedbackId(1);
            when(feedbackRepository.getFeedback(probe)).thenReturn(testFeedback);

            Feedback result = feedbackService.getFeedback(probe);

            assertThat(result.getFeedbackId()).isEqualTo(1);
            assertThat(result.getRating()).isEqualTo(5);
        }

        @Test
        @DisplayName("Should get all feedbacks for a doctor")
        void shouldGetAllFeedbacksForDoctor() {
            Feedback secondFeedback = new Feedback();
            secondFeedback.setFeedbackId(2);
            secondFeedback.setRating(4);
            secondFeedback.setDoctor(testDoctor);

            when(feedbackRepository.getAllFeedbacks(testDoctor))
                    .thenReturn(List.of(testFeedback, secondFeedback));

            List<Feedback> result = feedbackService.getAllFeedbacks(testDoctor);

            assertThat(result).hasSize(2);
        }

        @Test
        @DisplayName("Should get feedback by appointment ID")
        void shouldGetFeedbackByAppointmentId() {
            when(feedbackRepository.getFeedbackByAppointment(1))
                    .thenReturn(Optional.of(testFeedback));

            Optional<Feedback> result = feedbackService.getFeedbackByAppointment(1);

            assertThat(result).isPresent();
            assertThat(result.get().getRating()).isEqualTo(5);
        }

        @Test
        @DisplayName("Should return empty when no feedback for appointment")
        void shouldReturnEmptyWhenNoFeedbackForAppointment() {
            when(feedbackRepository.getFeedbackByAppointment(999))
                    .thenReturn(Optional.empty());

            Optional<Feedback> result = feedbackService.getFeedbackByAppointment(999);

            assertThat(result).isEmpty();
        }
    }
}
