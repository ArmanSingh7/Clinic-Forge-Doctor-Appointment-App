package com.doctorapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientHistoryDTO {

    private int patientId;
    private String patientName;
    private int doctorId;
    private String doctorName;
    private int totalVisits;
    private List<VisitDetail> visits;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VisitDetail {
        private int appointmentId;
        private LocalDate appointmentDate;
        private String appointmentStatus;
        private String remark;
        private String timeSlot;
        private List<MedicineDetail> medicines;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicineDetail {
        private int medicineId;
        private String medicineName;
        private String dosage;
        private String frequency;
        private String duration;
        private String notes;
    }
}
