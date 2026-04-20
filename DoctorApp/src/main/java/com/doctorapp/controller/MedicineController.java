package com.doctorapp.controller;

import com.doctorapp.dto.ApiResponse;
import com.doctorapp.entity.Appointment;
import com.doctorapp.entity.Medicine;
import com.doctorapp.exception.ResourceNotFoundException;
import com.doctorapp.repository.jpa.AppointmentJpaRepository;
import com.doctorapp.repository.jpa.MedicineJpaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
@Tag(name = "Medicine Module", description = "Prescription and medicine management")
public class MedicineController {

    @Autowired
    private MedicineJpaRepository medicineRepository;

    @Autowired
    private AppointmentJpaRepository appointmentJpaRepository;

    @Operation(summary = "Add medicines for an appointment")
    @PostMapping("/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<List<Medicine>>> addMedicines(
            @PathVariable int appointmentId,
            @RequestBody List<Medicine> medicines) {
        Appointment appointment = appointmentJpaRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "appointmentId", appointmentId));

        medicines.forEach(m -> m.setAppointment(appointment));
        List<Medicine> saved = medicineRepository.saveAll(medicines);
        return new ResponseEntity<>(ApiResponse.created("Medicines added successfully", saved), HttpStatus.CREATED);
    }

    @Operation(summary = "Get medicines for an appointment")
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<List<Medicine>>> getMedicinesByAppointment(@PathVariable int appointmentId) {
        Appointment appointment = new Appointment();
        appointment.setAppointmentId(appointmentId);
        List<Medicine> medicines = medicineRepository.findByAppointment(appointment);
        return ResponseEntity.ok(ApiResponse.success("Medicines retrieved", medicines));
    }

    @Operation(summary = "Update a medicine")
    @PutMapping("/{medicineId}")
    public ResponseEntity<ApiResponse<Medicine>> updateMedicine(
            @PathVariable int medicineId,
            @RequestBody Medicine medicine) {
        Medicine existing = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "medicineId", medicineId));
        existing.setMedicineName(medicine.getMedicineName());
        existing.setDosage(medicine.getDosage());
        existing.setFrequency(medicine.getFrequency());
        existing.setDuration(medicine.getDuration());
        existing.setNotes(medicine.getNotes());
        Medicine updated = medicineRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.success("Medicine updated", updated));
    }

    @Operation(summary = "Delete a medicine")
    @DeleteMapping("/{medicineId}")
    public ResponseEntity<ApiResponse<Void>> deleteMedicine(@PathVariable int medicineId) {
        Medicine existing = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "medicineId", medicineId));
        medicineRepository.delete(existing);
        return ResponseEntity.ok(ApiResponse.success("Medicine deleted", null));
    }
}
