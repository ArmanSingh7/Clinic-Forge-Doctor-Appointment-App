package com.doctorapp.service.impl;

import com.doctorapp.dto.AppointmentDTO;
import com.doctorapp.entity.*;
import com.doctorapp.exception.ResourceNotFoundException;
import com.doctorapp.repository.IAppointmentRepository;
import com.doctorapp.repository.jpa.AvailabilityDatesJpaRepository;
import com.doctorapp.repository.jpa.DoctorJpaRepository;
import com.doctorapp.repository.jpa.PatientJpaRepository;
import com.doctorapp.repository.jpa.TimeSlotJpaRepository;
import com.doctorapp.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceImplTest {

    @InjectMocks
    private AppointmentServiceImpl appointmentService;

    @Mock
    private IAppointmentRepository appointmentRepository;

    @Mock
    private PatientJpaRepository patientJpaRepository;

    @Mock
    private DoctorJpaRepository doctorJpaRepository;

    @Mock
    private AvailabilityDatesJpaRepository availabilityDatesJpaRepository;

    @Mock
    private TimeSlotJpaRepository timeSlotJpaRepository;

    @Mock
    private NotificationService notificationService;

    private Patient testPatient;
    private Doctor testDoctor;
    private User patientUser;
    private User doctorUser;
    private Appointment testAppointment;

    @BeforeEach
    void setUp() {
        patientUser = new User();
        patientUser.setUserId(1);
        patientUser.setUserName("patientuser");
        patientUser.setRole("PATIENT");

        doctorUser = new User();
        doctorUser.setUserId(2);
        doctorUser.setUserName("doctoruser");
        doctorUser.setRole("DOCTOR");

        testPatient = new Patient();
        testPatient.setPatientId(1);
        testPatient.setPatientName("John Doe");
        testPatient.setUser(patientUser);

        testDoctor = new Doctor();
        testDoctor.setDoctorId(1);
        testDoctor.setDoctorName("Dr. Smith");
        testDoctor.setUser(doctorUser);

        testAppointment = new Appointment();
        testAppointment.setAppointmentId(1);
        testAppointment.setPatient(testPatient);
        testAppointment.setDoctor(testDoctor);
        testAppointment.setAppointmentDate(LocalDate.of(2026, 5, 1));
        testAppointment.setAppointmentStatus("PENDING");
    }

    // ======================================================
    // BOOK APPOINTMENT TESTS
    // ======================================================

    @Nested
    @DisplayName("Book Appointment")
    class BookAppointmentTests {

        @Test
        @DisplayName("Should book appointment successfully when doctor is available")
        void shouldBookAppointmentSuccessfully() {
            AppointmentDTO dto = new AppointmentDTO();
            dto.setPatientId(1);
            dto.setDoctorId(1);
            dto.setAppointmentDate(LocalDate.of(2026, 5, 1));
            dto.setRemark("Regular checkup");

            AvailabilityDates availability = new AvailabilityDates();
            availability.setFromDate(LocalDate.of(2026, 4, 28));
            availability.setEndDate(LocalDate.of(2026, 5, 5));
            availability.setDoctor(testDoctor);

            when(patientJpaRepository.findById(1)).thenReturn(Optional.of(testPatient));
            when(doctorJpaRepository.findById(1)).thenReturn(Optional.of(testDoctor));
            when(availabilityDatesJpaRepository.findByDoctor(testDoctor)).thenReturn(List.of(availability));
            when(appointmentRepository.addAppointment(any(Appointment.class))).thenReturn(testAppointment);

            Appointment result = appointmentService.bookAppointment(dto);

            assertThat(result).isNotNull();
            assertThat(result.getAppointmentId()).isEqualTo(1);
            verify(appointmentRepository).addAppointment(any(Appointment.class));
            verify(notificationService).createNotification(eq(2), anyString(), anyString(),
                    eq("APPOINTMENT_BOOKED"), anyLong());
        }

        @Test
        @DisplayName("Should book appointment with time slot")
        void shouldBookAppointmentWithTimeSlot() {
            AppointmentDTO dto = new AppointmentDTO();
            dto.setPatientId(1);
            dto.setDoctorId(1);
            dto.setAppointmentDate(LocalDate.of(2026, 5, 1));
            dto.setTimeSlotId(10);

            TimeSlot slot = new TimeSlot();
            slot.setTimeSlotId(10);
            slot.setDoctor(testDoctor);
            slot.setDate(LocalDate.of(2026, 5, 1));
            slot.setStartTime(LocalTime.of(9, 0));
            slot.setEndTime(LocalTime.of(9, 30));
            slot.setBooked(false);

            AvailabilityDates availability = new AvailabilityDates();
            availability.setFromDate(LocalDate.of(2026, 4, 28));
            availability.setEndDate(LocalDate.of(2026, 5, 5));

            when(patientJpaRepository.findById(1)).thenReturn(Optional.of(testPatient));
            when(doctorJpaRepository.findById(1)).thenReturn(Optional.of(testDoctor));
            when(availabilityDatesJpaRepository.findByDoctor(testDoctor)).thenReturn(List.of(availability));
            when(timeSlotJpaRepository.findByIdWithLock(10)).thenReturn(Optional.of(slot));
            when(appointmentRepository.addAppointment(any(Appointment.class))).thenReturn(testAppointment);

            Appointment result = appointmentService.bookAppointment(dto);

            assertThat(result).isNotNull();
            verify(timeSlotJpaRepository).findByIdWithLock(10);
        }

        @Test
        @DisplayName("Should throw exception when doctor is not available on date")
        void shouldThrowExceptionWhenDoctorNotAvailable() {
            AppointmentDTO dto = new AppointmentDTO();
            dto.setPatientId(1);
            dto.setDoctorId(1);
            dto.setAppointmentDate(LocalDate.of(2026, 6, 15));

            AvailabilityDates availability = new AvailabilityDates();
            availability.setFromDate(LocalDate.of(2026, 5, 1));
            availability.setEndDate(LocalDate.of(2026, 5, 5));

            when(patientJpaRepository.findById(1)).thenReturn(Optional.of(testPatient));
            when(doctorJpaRepository.findById(1)).thenReturn(Optional.of(testDoctor));
            when(availabilityDatesJpaRepository.findByDoctor(testDoctor)).thenReturn(List.of(availability));

            assertThatThrownBy(() -> appointmentService.bookAppointment(dto))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Doctor is not available on");
        }

        @Test
        @DisplayName("Should throw exception when patient not found")
        void shouldThrowExceptionWhenPatientNotFound() {
            AppointmentDTO dto = new AppointmentDTO();
            dto.setPatientId(999);
            dto.setDoctorId(1);
            dto.setAppointmentDate(LocalDate.of(2026, 5, 1));

            when(patientJpaRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> appointmentService.bookAppointment(dto))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Should throw exception when doctor not found")
        void shouldThrowExceptionWhenDoctorNotFound() {
            AppointmentDTO dto = new AppointmentDTO();
            dto.setPatientId(1);
            dto.setDoctorId(999);
            dto.setAppointmentDate(LocalDate.of(2026, 5, 1));

            when(patientJpaRepository.findById(1)).thenReturn(Optional.of(testPatient));
            when(doctorJpaRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> appointmentService.bookAppointment(dto))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Should throw exception when time slot is already booked")
        void shouldThrowExceptionWhenTimeSlotAlreadyBooked() {
            AppointmentDTO dto = new AppointmentDTO();
            dto.setPatientId(1);
            dto.setDoctorId(1);
            dto.setAppointmentDate(LocalDate.of(2026, 5, 1));
            dto.setTimeSlotId(10);

            TimeSlot bookedSlot = new TimeSlot();
            bookedSlot.setTimeSlotId(10);
            bookedSlot.setBooked(true);

            AvailabilityDates availability = new AvailabilityDates();
            availability.setFromDate(LocalDate.of(2026, 4, 28));
            availability.setEndDate(LocalDate.of(2026, 5, 5));

            when(patientJpaRepository.findById(1)).thenReturn(Optional.of(testPatient));
            when(doctorJpaRepository.findById(1)).thenReturn(Optional.of(testDoctor));
            when(availabilityDatesJpaRepository.findByDoctor(testDoctor)).thenReturn(List.of(availability));
            when(timeSlotJpaRepository.findByIdWithLock(10)).thenReturn(Optional.of(bookedSlot));

            assertThatThrownBy(() -> appointmentService.bookAppointment(dto))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("already booked");
        }
    }

    // ======================================================
    // APPROVE / REJECT / CONFIRM / CANCEL
    // ======================================================

    @Nested
    @DisplayName("Appointment Status Transitions")
    class StatusTransitionTests {

        @Test
        @DisplayName("Should approve appointment")
        void shouldApproveAppointment() {
            when(appointmentRepository.getAppointment(1)).thenReturn(testAppointment);
            testAppointment.setAppointmentStatus("APPROVED");
            when(appointmentRepository.updateAppointment(any())).thenReturn(testAppointment);

            Appointment result = appointmentService.approveAppointment(1);

            assertThat(result.getAppointmentStatus()).isEqualTo("APPROVED");
            verify(notificationService).createNotification(eq(1), anyString(), anyString(),
                    eq("APPOINTMENT_APPROVED"), eq(1L));
        }

        @Test
        @DisplayName("Should reject appointment")
        void shouldRejectAppointment() {
            when(appointmentRepository.getAppointment(1)).thenReturn(testAppointment);
            testAppointment.setAppointmentStatus("REJECTED");
            when(appointmentRepository.updateAppointment(any())).thenReturn(testAppointment);

            Appointment result = appointmentService.rejectAppointment(1);

            assertThat(result.getAppointmentStatus()).isEqualTo("REJECTED");
            verify(notificationService).createNotification(eq(1), anyString(), anyString(),
                    eq("APPOINTMENT_REJECTED"), eq(1L));
        }

        @Test
        @DisplayName("Should confirm appointment and mark time slot as booked")
        void shouldConfirmAppointmentAndMarkSlotBooked() {
            TimeSlot slot = new TimeSlot();
            slot.setTimeSlotId(10);
            slot.setBooked(false);
            testAppointment.setTimeSlot(slot);

            when(appointmentRepository.getAppointment(1)).thenReturn(testAppointment);
            testAppointment.setAppointmentStatus("CONFIRMED");
            when(appointmentRepository.updateAppointment(any())).thenReturn(testAppointment);

            Appointment result = appointmentService.confirmAppointment(1);

            assertThat(result.getAppointmentStatus()).isEqualTo("CONFIRMED");
            assertThat(slot.isBooked()).isTrue();
            verify(timeSlotJpaRepository).save(slot);
        }

        @Test
        @DisplayName("Should confirm appointment without time slot")
        void shouldConfirmAppointmentWithoutTimeSlot() {
            testAppointment.setTimeSlot(null);

            when(appointmentRepository.getAppointment(1)).thenReturn(testAppointment);
            testAppointment.setAppointmentStatus("CONFIRMED");
            when(appointmentRepository.updateAppointment(any())).thenReturn(testAppointment);

            Appointment result = appointmentService.confirmAppointment(1);

            assertThat(result.getAppointmentStatus()).isEqualTo("CONFIRMED");
            verify(timeSlotJpaRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should cancel a PENDING appointment")
        void shouldCancelPendingAppointment() {
            testAppointment.setAppointmentStatus("PENDING");

            when(appointmentRepository.getAppointment(1)).thenReturn(testAppointment);
            when(appointmentRepository.updateAppointment(any())).thenAnswer(inv -> {
                Appointment a = inv.getArgument(0);
                return a;
            });

            Appointment result = appointmentService.cancelAppointment(1);

            assertThat(result.getAppointmentStatus()).isEqualTo("CANCELLED");
        }

        @Test
        @DisplayName("Should throw exception when cancelling CONFIRMED appointment")
        void shouldThrowExceptionWhenCancellingConfirmedAppointment() {
            testAppointment.setAppointmentStatus("CONFIRMED");
            when(appointmentRepository.getAppointment(1)).thenReturn(testAppointment);

            assertThatThrownBy(() -> appointmentService.cancelAppointment(1))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Cannot cancel a confirmed appointment");
        }
    }

    // ======================================================
    // QUERY APPOINTMENTS
    // ======================================================

    @Nested
    @DisplayName("Query Appointments")
    class QueryAppointmentTests {

        @Test
        @DisplayName("Should get all appointments")
        void shouldGetAllAppointments() {
            when(appointmentRepository.getAllAppointments()).thenReturn(List.of(testAppointment));

            List<Appointment> result = appointmentService.getAllAppointments();

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Should get appointment by ID")
        void shouldGetAppointmentById() {
            when(appointmentRepository.getAppointment(1)).thenReturn(testAppointment);

            Appointment result = appointmentService.getAppointment(1);

            assertThat(result.getAppointmentId()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should get appointments by doctor")
        void shouldGetAppointmentsByDoctor() {
            when(appointmentRepository.getAppointments(testDoctor)).thenReturn(List.of(testAppointment));

            List<Appointment> result = appointmentService.getAppointments(testDoctor);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Should get appointments by patient")
        void shouldGetAppointmentsByPatient() {
            when(appointmentRepository.getAppointments(testPatient)).thenReturn(List.of(testAppointment));

            List<Appointment> result = appointmentService.getAppointments(testPatient);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Should get appointments by date")
        void shouldGetAppointmentsByDate() {
            LocalDate date = LocalDate.of(2026, 5, 1);
            when(appointmentRepository.getAppointments(date)).thenReturn(List.of(testAppointment));

            List<Appointment> result = appointmentService.getAppointments(date);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Should delete appointment")
        void shouldDeleteAppointment() {
            when(appointmentRepository.deleteAppointment(1)).thenReturn(testAppointment);

            Appointment result = appointmentService.deleteAppointment(1);

            assertThat(result).isNotNull();
            verify(appointmentRepository).deleteAppointment(1);
        }
    }
}
