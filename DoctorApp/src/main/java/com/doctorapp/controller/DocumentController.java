package com.doctorapp.controller;

import com.doctorapp.dto.ApiResponse;
import com.doctorapp.entity.Appointment;
import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.MedicalDocument;
import com.doctorapp.entity.Patient;
import com.doctorapp.exception.ResourceNotFoundException;
import com.doctorapp.repository.jpa.AppointmentJpaRepository;
import com.doctorapp.repository.jpa.DoctorJpaRepository;
import com.doctorapp.repository.jpa.MedicalDocumentJpaRepository;
import com.doctorapp.repository.jpa.PatientJpaRepository;
import com.doctorapp.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@Tag(name = "Document Module", description = "Medical document upload and management")
public class DocumentController {

    @Autowired
    private MedicalDocumentJpaRepository documentRepository;

    @Autowired
    private PatientJpaRepository patientJpaRepository;

    @Autowired
    private DoctorJpaRepository doctorJpaRepository;

    @Autowired
    private AppointmentJpaRepository appointmentJpaRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Operation(summary = "Upload a medical document for a patient")
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<MedicalDocument>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("patientId") int patientId,
            @RequestParam(value = "appointmentId", required = false) Integer appointmentId,
            @RequestParam(value = "description", required = false) String description) {

        Patient patient = patientJpaRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "patientId", patientId));

        String storedName = fileStorageService.storeFile(file);

        MedicalDocument doc = new MedicalDocument();
        doc.setPatient(patient);
        doc.setFileName(file.getOriginalFilename());
        doc.setStoredFileName(storedName);
        doc.setFileType(file.getContentType());
        doc.setUploadDate(LocalDateTime.now());
        doc.setDescription(description);

        if (appointmentId != null) {
            Appointment appointment = appointmentJpaRepository.findById(appointmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment", "appointmentId", appointmentId));
            doc.setAppointment(appointment);
        }

        MedicalDocument saved = documentRepository.save(doc);
        return new ResponseEntity<>(ApiResponse.created("Document uploaded successfully", saved), HttpStatus.CREATED);
    }

    @Operation(summary = "Get documents by patient ID")
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<MedicalDocument>>> getDocumentsByPatient(@PathVariable int patientId) {
        Patient patient = new Patient();
        patient.setPatientId(patientId);
        List<MedicalDocument> docs = documentRepository.findByPatient(patient);
        return ResponseEntity.ok(ApiResponse.success("Documents retrieved", docs));
    }

    @Operation(summary = "Get documents by appointment ID")
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<List<MedicalDocument>>> getDocumentsByAppointment(
            @PathVariable int appointmentId) {
        Appointment appointment = new Appointment();
        appointment.setAppointmentId(appointmentId);
        List<MedicalDocument> docs = documentRepository.findByAppointment(appointment);
        return ResponseEntity.ok(ApiResponse.success("Documents retrieved", docs));
    }

    @Operation(summary = "Upload a document for a doctor")
    @PostMapping("/doctor/upload")
    public ResponseEntity<ApiResponse<MedicalDocument>> uploadDoctorDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("doctorId") int doctorId,
            @RequestParam(value = "description", required = false) String description) {

        Doctor doctor = doctorJpaRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "doctorId", doctorId));

        String storedName = fileStorageService.storeFile(file);

        MedicalDocument doc = new MedicalDocument();
        doc.setDoctor(doctor);
        doc.setFileName(file.getOriginalFilename());
        doc.setStoredFileName(storedName);
        doc.setFileType(file.getContentType());
        doc.setUploadDate(LocalDateTime.now());
        doc.setDescription(description);

        MedicalDocument saved = documentRepository.save(doc);
        return new ResponseEntity<>(ApiResponse.created("Document uploaded successfully", saved), HttpStatus.CREATED);
    }

    @Operation(summary = "Get documents by doctor ID")
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<MedicalDocument>>> getDocumentsByDoctor(@PathVariable int doctorId) {
        Doctor doctor = new Doctor();
        doctor.setDoctorId(doctorId);
        List<MedicalDocument> docs = documentRepository.findByDoctor(doctor);
        return ResponseEntity.ok(ApiResponse.success("Documents retrieved", docs));
    }

    @Operation(summary = "Download a document")
    @GetMapping("/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable int documentId) {
        MedicalDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "documentId", documentId));

        Resource resource = fileStorageService.loadFile(doc.getStoredFileName());
        return ResponseEntity.ok()
                .contentType(MediaType
                        .parseMediaType(doc.getFileType() != null ? doc.getFileType() : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                .body(resource);
    }

    @Operation(summary = "Delete a document")
    @DeleteMapping("/{documentId}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable int documentId) {
        MedicalDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "documentId", documentId));

        fileStorageService.deleteFile(doc.getStoredFileName());
        documentRepository.delete(doc);
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully", null));
    }
}
