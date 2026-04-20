package com.doctorapp.service.impl;

import com.doctorapp.entity.AvailabilityDates;
import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.TimeSlot;
import com.doctorapp.repository.IDoctorRepository;
import com.doctorapp.repository.jpa.TimeSlotJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorServiceImplTest {

    @InjectMocks
    private DoctorServiceImpl doctorService;

    @Mock
    private IDoctorRepository doctorRepository;

    @Mock
    private TimeSlotJpaRepository timeSlotJpaRepository;

    @Captor
    private ArgumentCaptor<List<TimeSlot>> timeSlotsCaptor;

    private Doctor testDoctor;

    @BeforeEach
    void setUp() {
        testDoctor = new Doctor();
        testDoctor.setDoctorId(1);
        testDoctor.setDoctorName("Dr. Smith");
        testDoctor.setSpeciality("Cardiology");
        testDoctor.setLocation("New York");
        testDoctor.setCity("New York");
        testDoctor.setHospitalName("City Hospital");
        testDoctor.setMobileNo("9876543210");
        testDoctor.setEmail("dr.smith@test.com");
        testDoctor.setPassword("encoded");
        testDoctor.setChargedPerVisit(500.0);
    }

    // ======================================================
    // DOCTOR CRUD TESTS
    // ======================================================

    @Nested
    @DisplayName("Doctor CRUD Operations")
    class DoctorCrudTests {

        @Test
        @DisplayName("Should add a new doctor")
        void shouldAddDoctor() {
            when(doctorRepository.addDoctor(any(Doctor.class))).thenReturn(testDoctor);

            Doctor result = doctorService.addDoctor(testDoctor);

            assertThat(result).isNotNull();
            assertThat(result.getDoctorName()).isEqualTo("Dr. Smith");
            assertThat(result.getSpeciality()).isEqualTo("Cardiology");
            verify(doctorRepository).addDoctor(testDoctor);
        }

        @Test
        @DisplayName("Should update doctor profile")
        void shouldUpdateDoctorProfile() {
            testDoctor.setChargedPerVisit(600.0);
            when(doctorRepository.updateDoctorProfile(any(Doctor.class))).thenReturn(testDoctor);

            Doctor result = doctorService.updateDoctorProfile(testDoctor);

            assertThat(result.getChargedPerVisit()).isEqualTo(600.0);
            verify(doctorRepository).updateDoctorProfile(testDoctor);
        }

        @Test
        @DisplayName("Should get doctor by probe")
        void shouldGetDoctor() {
            Doctor probe = new Doctor();
            probe.setDoctorId(1);
            when(doctorRepository.getDoctor(probe)).thenReturn(testDoctor);

            Doctor result = doctorService.getDoctor(probe);

            assertThat(result.getDoctorName()).isEqualTo("Dr. Smith");
        }

        @Test
        @DisplayName("Should remove doctor")
        void shouldRemoveDoctor() {
            when(doctorRepository.removeDoctor(testDoctor)).thenReturn(testDoctor);

            Doctor result = doctorService.removeDoctor(testDoctor);

            assertThat(result).isNotNull();
            verify(doctorRepository).removeDoctor(testDoctor);
        }

        @Test
        @DisplayName("Should get all doctors")
        void shouldGetAllDoctors() {
            Doctor anotherDoctor = new Doctor();
            anotherDoctor.setDoctorId(2);
            anotherDoctor.setDoctorName("Dr. Jones");

            when(doctorRepository.getDoctorList()).thenReturn(List.of(testDoctor, anotherDoctor));

            List<Doctor> result = doctorService.getDoctorList();

            assertThat(result).hasSize(2);
        }

        @Test
        @DisplayName("Should get doctors by speciality")
        void shouldGetDoctorsBySpeciality() {
            when(doctorRepository.getDoctorList("Cardiology")).thenReturn(List.of(testDoctor));

            List<Doctor> result = doctorService.getDoctorList("Cardiology");

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getSpeciality()).isEqualTo("Cardiology");
        }
    }

    // ======================================================
    // AVAILABILITY & TIME SLOT TESTS
    // ======================================================

    @Nested
    @DisplayName("Doctor Availability Management")
    class AvailabilityTests {

        @Test
        @DisplayName("Should add availability and generate time slots")
        void shouldAddAvailabilityAndGenerateTimeSlots() {
            AvailabilityDates avail = new AvailabilityDates();
            avail.setAvailabilityId(1);
            avail.setDoctor(testDoctor);
            avail.setFromDate(LocalDate.of(2026, 5, 1));
            avail.setEndDate(LocalDate.of(2026, 5, 1)); // Single day

            when(doctorRepository.addAvailability(avail)).thenReturn(avail);
            when(timeSlotJpaRepository.findByDoctorAndDate(testDoctor, LocalDate.of(2026, 5, 1)))
                    .thenReturn(Collections.emptyList());

            AvailabilityDates result = doctorService.addAvailability(avail);

            assertThat(result).isNotNull();
            verify(timeSlotJpaRepository).saveAll(timeSlotsCaptor.capture());

            List<TimeSlot> generatedSlots = timeSlotsCaptor.getValue();
            // 9am to 5pm in 30-min slots = 16 slots
            assertThat(generatedSlots).hasSize(16);
            assertThat(generatedSlots.get(0).getStartTime()).isEqualTo(LocalTime.of(9, 0));
            assertThat(generatedSlots.get(0).getEndTime()).isEqualTo(LocalTime.of(9, 30));
            assertThat(generatedSlots.get(15).getStartTime()).isEqualTo(LocalTime.of(16, 30));
            assertThat(generatedSlots.get(15).getEndTime()).isEqualTo(LocalTime.of(17, 0));
            assertThat(generatedSlots).allMatch(s -> !s.isBooked());
            assertThat(generatedSlots).allMatch(s -> s.getDoctor().equals(testDoctor));
        }

        @Test
        @DisplayName("Should add availability for multiple days")
        void shouldAddAvailabilityForMultipleDays() {
            AvailabilityDates avail = new AvailabilityDates();
            avail.setAvailabilityId(1);
            avail.setDoctor(testDoctor);
            avail.setFromDate(LocalDate.of(2026, 5, 1));
            avail.setEndDate(LocalDate.of(2026, 5, 3)); // 3 days

            when(doctorRepository.addAvailability(avail)).thenReturn(avail);
            when(timeSlotJpaRepository.findByDoctorAndDate(eq(testDoctor), any(LocalDate.class)))
                    .thenReturn(Collections.emptyList());

            doctorService.addAvailability(avail);

            verify(timeSlotJpaRepository).saveAll(timeSlotsCaptor.capture());
            // 16 slots per day x 3 days = 48 slots
            assertThat(timeSlotsCaptor.getValue()).hasSize(48);
        }

        @Test
        @DisplayName("Should not regenerate slots if they already exist for a date")
        void shouldNotRegenerateExistingSlots() {
            AvailabilityDates avail = new AvailabilityDates();
            avail.setAvailabilityId(1);
            avail.setDoctor(testDoctor);
            avail.setFromDate(LocalDate.of(2026, 5, 1));
            avail.setEndDate(LocalDate.of(2026, 5, 1));

            TimeSlot existingSlot = new TimeSlot();
            existingSlot.setTimeSlotId(1);

            when(doctorRepository.addAvailability(avail)).thenReturn(avail);
            when(timeSlotJpaRepository.findByDoctorAndDate(testDoctor, LocalDate.of(2026, 5, 1)))
                    .thenReturn(List.of(existingSlot));

            doctorService.addAvailability(avail);

            verify(timeSlotJpaRepository, never()).saveAll(any());
        }

        @Test
        @DisplayName("Should update availability and regenerate time slots")
        void shouldUpdateAvailabilityAndRegenerateSlots() {
            AvailabilityDates avail = new AvailabilityDates();
            avail.setAvailabilityId(1);
            avail.setDoctor(testDoctor);
            avail.setFromDate(LocalDate.of(2026, 5, 1));
            avail.setEndDate(LocalDate.of(2026, 5, 1));

            when(doctorRepository.updateAvailability(avail)).thenReturn(avail);
            when(timeSlotJpaRepository.findByDoctorAndDate(testDoctor, LocalDate.of(2026, 5, 1)))
                    .thenReturn(Collections.emptyList());

            AvailabilityDates result = doctorService.updateAvailability(avail);

            assertThat(result).isNotNull();
            verify(timeSlotJpaRepository).deleteByDoctorAndDateBetween(
                    testDoctor, LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 1));
            verify(timeSlotJpaRepository).saveAll(any());
        }
    }
}
