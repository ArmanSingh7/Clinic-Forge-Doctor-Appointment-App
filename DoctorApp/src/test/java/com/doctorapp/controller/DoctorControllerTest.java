package com.doctorapp.controller;

import com.doctorapp.entity.AvailabilityDates;
import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.TimeSlot;
import com.doctorapp.repository.jpa.AvailabilityDatesJpaRepository;
import com.doctorapp.repository.jpa.DoctorJpaRepository;
import com.doctorapp.repository.jpa.TimeSlotJpaRepository;
import com.doctorapp.service.EmailService;
import com.doctorapp.service.IDoctorService;
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
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DoctorControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private DoctorController doctorController;

    @Mock
    private IDoctorService doctorService;

    @Mock
    private DoctorJpaRepository doctorJpaRepository;

    @Mock
    private AvailabilityDatesJpaRepository availabilityDatesJpaRepository;

    @Mock
    private TimeSlotJpaRepository timeSlotJpaRepository;

    @Mock
    private EmailService emailService;

    private Doctor testDoctor;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(doctorController).build();

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

    @Nested
    @DisplayName("GET /api/doctors")
    class GetDoctorsTests {

        @Test
        @DisplayName("Should get all doctors")
        void shouldGetAllDoctors() throws Exception {
            when(doctorService.getDoctorList()).thenReturn(List.of(testDoctor));

            mockMvc.perform(get("/api/doctors"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data[0].doctorName").value("Dr. Smith"));
        }

        @Test
        @DisplayName("Should get doctor by ID")
        void shouldGetDoctorById() throws Exception {
            when(doctorService.getDoctor(any(Doctor.class))).thenReturn(testDoctor);

            mockMvc.perform(get("/api/doctors/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.doctorName").value("Dr. Smith"))
                    .andExpect(jsonPath("$.data.speciality").value("Cardiology"));
        }

        @Test
        @DisplayName("Should get doctors by speciality")
        void shouldGetDoctorsBySpeciality() throws Exception {
            when(doctorService.getDoctorList("Cardiology")).thenReturn(List.of(testDoctor));

            mockMvc.perform(get("/api/doctors/speciality/Cardiology"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data[0].speciality").value("Cardiology"));
        }
    }

    @Nested
    @DisplayName("GET /api/doctors/search")
    class SearchDoctorsTests {

        @Test
        @DisplayName("Should search by city and speciality")
        void shouldSearchByCityAndSpeciality() throws Exception {
            when(doctorJpaRepository.findByCityAndSpeciality("New York", "Cardiology"))
                    .thenReturn(List.of(testDoctor));

            mockMvc.perform(get("/api/doctors/search")
                    .param("city", "New York")
                    .param("speciality", "Cardiology"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data[0].city").value("New York"));
        }

        @Test
        @DisplayName("Should search by city only")
        void shouldSearchByCityOnly() throws Exception {
            when(doctorJpaRepository.findByCity("New York")).thenReturn(List.of(testDoctor));

            mockMvc.perform(get("/api/doctors/search")
                    .param("city", "New York"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray());
        }

        @Test
        @DisplayName("Should search by speciality only")
        void shouldSearchBySpecialityOnly() throws Exception {
            when(doctorService.getDoctorList("Cardiology")).thenReturn(List.of(testDoctor));

            mockMvc.perform(get("/api/doctors/search")
                    .param("speciality", "Cardiology"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray());
        }

        @Test
        @DisplayName("Should return all doctors when no filters")
        void shouldReturnAllWhenNoFilters() throws Exception {
            when(doctorService.getDoctorList()).thenReturn(List.of(testDoctor));

            mockMvc.perform(get("/api/doctors/search"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray());
        }
    }

    @Nested
    @DisplayName("Doctor Availability Endpoints")
    class AvailabilityEndpointTests {

        @Test
        @DisplayName("Should get availability for doctor")
        void shouldGetAvailability() throws Exception {
            AvailabilityDates avail = new AvailabilityDates();
            avail.setAvailabilityId(1);
            avail.setFromDate(LocalDate.of(2026, 5, 1));
            avail.setEndDate(LocalDate.of(2026, 5, 5));

            when(availabilityDatesJpaRepository.findByDoctor(any(Doctor.class)))
                    .thenReturn(List.of(avail));

            mockMvc.perform(get("/api/doctors/availability/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray());
        }

        @Test
        @DisplayName("Should get available time slots")
        void shouldGetAvailableTimeSlots() throws Exception {
            TimeSlot slot = new TimeSlot();
            slot.setTimeSlotId(1);
            slot.setDate(LocalDate.of(2026, 5, 1));
            slot.setStartTime(LocalTime.of(9, 0));
            slot.setEndTime(LocalTime.of(9, 30));
            slot.setBooked(false);

            when(timeSlotJpaRepository.findByDoctorAndDateAndIsBookedFalse(any(Doctor.class),
                    eq(LocalDate.of(2026, 5, 1)))).thenReturn(List.of(slot));

            mockMvc.perform(get("/api/doctors/1/slots")
                    .param("date", "2026-05-01"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data[0].booked").value(false));
        }
    }

    @Nested
    @DisplayName("POST /api/doctors/send-email")
    class EmailTests {

        @Test
        @DisplayName("Should send email successfully")
        void shouldSendEmail() throws Exception {
            Map<String, String> payload = Map.of(
                    "to", "patient@test.com",
                    "subject", "Appointment Reminder",
                    "body", "Please visit tomorrow");

            mockMvc.perform(post("/api/doctors/send-email")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(payload)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Email sent successfully"));

            verify(emailService).sendEmail("patient@test.com", "Appointment Reminder", "Please visit tomorrow");
        }

        @Test
        @DisplayName("Should return 400 for missing email fields")
        void shouldReturn400ForMissingFields() throws Exception {
            Map<String, String> payload = Map.of("to", "patient@test.com");

            mockMvc.perform(post("/api/doctors/send-email")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(payload)))
                    .andExpect(status().isBadRequest());
        }
    }
}
