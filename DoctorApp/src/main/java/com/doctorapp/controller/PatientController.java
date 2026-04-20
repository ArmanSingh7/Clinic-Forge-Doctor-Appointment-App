package com.doctorapp.controller;

import com.doctorapp.dto.ApiResponse;
import com.doctorapp.dto.PatientHistoryDTO;
import com.doctorapp.entity.Appointment;
import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Medicine;
import com.doctorapp.entity.Patient;
import com.doctorapp.repository.jpa.AppointmentJpaRepository;
import com.doctorapp.repository.jpa.MedicineJpaRepository;
import com.doctorapp.repository.jpa.PatientJpaRepository;
import com.doctorapp.service.IPatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patients")
@Tag(name = "Patient Module", description = "Patient registration and management")
public class PatientController {

    @Autowired
    private IPatientService patientService;

    @Autowired
    private AppointmentJpaRepository appointmentJpaRepository;

    @Autowired
    private MedicineJpaRepository medicineJpaRepository;

    @Autowired
    private PatientJpaRepository patientJpaRepository;

    @Operation(summary = "Register a new patient")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Patient>> addPatient(@Valid @RequestBody Patient patient) {
        Patient created = patientService.addPatient(patient);
        return new ResponseEntity<>(ApiResponse.created("Patient registered successfully", created),
                HttpStatus.CREATED);
    }

    @Operation(summary = "Update patient details")
    @PutMapping("/update")
    public ResponseEntity<ApiResponse<Patient>> updatePatient(@Valid @RequestBody Patient patient) {
        Patient updated = patientService.updatePatientDetails(patient);
        return ResponseEntity.ok(ApiResponse.success("Patient updated successfully", updated));
    }

    @Operation(summary = "Remove a patient")
    @DeleteMapping("/remove")
    public ResponseEntity<ApiResponse<Patient>> removePatient(@RequestBody Patient patient) {
        Patient removed = patientService.removePatientDetails(patient);
        return ResponseEntity.ok(ApiResponse.deleted("Patient removed successfully", removed));
    }

    @Operation(summary = "Get patient by ID")
    @GetMapping("/{patientId}")
    public ResponseEntity<ApiResponse<Patient>> getPatient(@PathVariable int patientId) {
        Patient probe = new Patient();
        probe.setPatientId(patientId);
        Patient found = patientService.getPatient(probe);
        return ResponseEntity.ok(ApiResponse.success("Patient retrieved successfully", found));
    }

    @Operation(summary = "Get all patients")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Patient>>> getAllPatients() {
        List<Patient> patients = patientService.getAllPatient();
        return ResponseEntity.ok(ApiResponse.success("Patients retrieved successfully", patients));
    }

    @Operation(summary = "Get patients by doctor ID")
    @GetMapping("/by-doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<Patient>>> getPatientsByDoctor(@PathVariable int doctorId) {
        Doctor doctor = new Doctor();
        doctor.setDoctorId(doctorId);
        List<Patient> patients = patientService.getPatientListByDoctor(doctor);
        return ResponseEntity.ok(ApiResponse.success("Patients retrieved for doctor", patients));
    }

    @Operation(summary = "Get patients by appointment date")
    @GetMapping("/by-date/{date}")
    public ResponseEntity<ApiResponse<List<Patient>>> getPatientsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Patient> patients = patientService.getPatientListByDate(date);
        return ResponseEntity.ok(ApiResponse.success("Patients retrieved for date", patients));
    }

    @Operation(summary = "Get visit history between a patient and a doctor")
    @GetMapping("/{patientId}/history")
    public ResponseEntity<ApiResponse<PatientHistoryDTO>> getPatientHistory(
            @PathVariable int patientId,
            @RequestParam int doctorId) {
        Patient patient = new Patient();
        patient.setPatientId(patientId);
        Doctor doctor = new Doctor();
        doctor.setDoctorId(doctorId);

        List<Appointment> appointments = appointmentJpaRepository
                .findByPatientAndDoctorOrderByAppointmentDateDesc(patient, doctor);

        Patient fullPatient = patientService.getPatient(patient);

        List<PatientHistoryDTO.VisitDetail> visits = appointments.stream().map(apt -> {
            List<Medicine> meds = medicineJpaRepository.findByAppointment(apt);
            List<PatientHistoryDTO.MedicineDetail> medDetails = meds.stream()
                    .map(m -> new PatientHistoryDTO.MedicineDetail(
                            m.getMedicineId(), m.getMedicineName(), m.getDosage(),
                            m.getFrequency(), m.getDuration(), m.getNotes()))
                    .collect(Collectors.toList());

            String timeSlotStr = apt.getTimeSlot() != null
                    ? apt.getTimeSlot().getStartTime() + " - " + apt.getTimeSlot().getEndTime()
                    : null;

            return new PatientHistoryDTO.VisitDetail(
                    apt.getAppointmentId(), apt.getAppointmentDate(),
                    apt.getAppointmentStatus(), apt.getRemark(), timeSlotStr, medDetails);
        }).collect(Collectors.toList());

        PatientHistoryDTO dto = new PatientHistoryDTO(
                patientId, fullPatient.getPatientName(),
                doctorId, appointments.isEmpty() ? "" : appointments.get(0).getDoctor().getDoctorName(),
                appointments.size(), visits);

        return ResponseEntity.ok(ApiResponse.success("Patient history retrieved", dto));
    }

    @Operation(summary = "Upload patient profile photo")
    @PostMapping("/{patientId}/photo")
    public ResponseEntity<ApiResponse<String>> uploadPhoto(@PathVariable int patientId,
            @RequestParam("file") MultipartFile file) {
        try {
            Patient probe = new Patient();
            probe.setPatientId(patientId);
            Patient patient = patientService.getPatient(probe);
            String base64 = "data:" + file.getContentType() + ";base64,"
                    + Base64.getEncoder().encodeToString(file.getBytes());
            patient.setProfilePhoto(base64);
            patientJpaRepository.save(patient);
            return ResponseEntity.ok(ApiResponse.success("Photo uploaded successfully", base64));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to upload photo"));
        }
    }
}
