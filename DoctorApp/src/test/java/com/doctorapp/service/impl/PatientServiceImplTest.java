package com.doctorapp.service.impl;

import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Patient;
import com.doctorapp.repository.IPatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PatientServiceImplTest {

    @InjectMocks
    private PatientServiceImpl patientService;

    @Mock
    private IPatientRepository patientRepository;

    private Patient testPatient;

    @BeforeEach
    void setUp() {
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

    // ======================================================
    // PATIENT CRUD TESTS
    // ======================================================

    @Nested
    @DisplayName("Patient CRUD Operations")
    class PatientCrudTests {

        @Test
        @DisplayName("Should add a new patient")
        void shouldAddPatient() {
            when(patientRepository.addPatient(any(Patient.class))).thenReturn(testPatient);

            Patient result = patientService.addPatient(testPatient);

            assertThat(result).isNotNull();
            assertThat(result.getPatientName()).isEqualTo("John Doe");
            assertThat(result.getBloodGroup()).isEqualTo("O+");
            assertThat(result.getAge()).isEqualTo(30);
            verify(patientRepository).addPatient(testPatient);
        }

        @Test
        @DisplayName("Should update patient details")
        void shouldUpdatePatientDetails() {
            testPatient.setAddress("456 Oak Ave");
            testPatient.setCity("Boston");
            when(patientRepository.updatePatientDetails(any(Patient.class))).thenReturn(testPatient);

            Patient result = patientService.updatePatientDetails(testPatient);

            assertThat(result.getAddress()).isEqualTo("456 Oak Ave");
            assertThat(result.getCity()).isEqualTo("Boston");
            verify(patientRepository).updatePatientDetails(testPatient);
        }

        @Test
        @DisplayName("Should remove a patient")
        void shouldRemovePatient() {
            when(patientRepository.removePatientDetails(any(Patient.class))).thenReturn(testPatient);

            Patient result = patientService.removePatientDetails(testPatient);

            assertThat(result).isNotNull();
            assertThat(result.getPatientId()).isEqualTo(1);
            verify(patientRepository).removePatientDetails(testPatient);
        }

        @Test
        @DisplayName("Should get patient by probe")
        void shouldGetPatient() {
            Patient probe = new Patient();
            probe.setPatientId(1);
            when(patientRepository.getPatient(probe)).thenReturn(testPatient);

            Patient result = patientService.getPatient(probe);

            assertThat(result.getPatientName()).isEqualTo("John Doe");
            assertThat(result.getEmail()).isEqualTo("john@test.com");
        }

        @Test
        @DisplayName("Should get all patients")
        void shouldGetAllPatients() {
            Patient secondPatient = new Patient();
            secondPatient.setPatientId(2);
            secondPatient.setPatientName("Jane Doe");

            when(patientRepository.getAllPatient()).thenReturn(List.of(testPatient, secondPatient));

            List<Patient> result = patientService.getAllPatient();

            assertThat(result).hasSize(2);
        }
    }

    // ======================================================
    // PATIENT QUERY TESTS
    // ======================================================

    @Nested
    @DisplayName("Patient Query Operations")
    class PatientQueryTests {

        @Test
        @DisplayName("Should get patients by doctor")
        void shouldGetPatientsByDoctor() {
            Doctor doctor = new Doctor();
            doctor.setDoctorId(1);

            when(patientRepository.getPatientListByDoctor(doctor)).thenReturn(List.of(testPatient));

            List<Patient> result = patientService.getPatientListByDoctor(doctor);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getPatientName()).isEqualTo("John Doe");
        }

        @Test
        @DisplayName("Should get patients by appointment date")
        void shouldGetPatientsByDate() {
            LocalDate date = LocalDate.of(2026, 5, 1);
            when(patientRepository.getPatientListByDate(date)).thenReturn(List.of(testPatient));

            List<Patient> result = patientService.getPatientListByDate(date);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Should return empty list when no patients for doctor")
        void shouldReturnEmptyListWhenNoPatientsForDoctor() {
            Doctor doctor = new Doctor();
            doctor.setDoctorId(999);

            when(patientRepository.getPatientListByDoctor(doctor)).thenReturn(List.of());

            List<Patient> result = patientService.getPatientListByDoctor(doctor);

            assertThat(result).isEmpty();
        }
    }
}
