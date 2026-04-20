package com.doctorapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "medical_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class MedicalDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int documentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String storedFileName;

    @Column
    private String fileType;

    @Column(nullable = false)
    private LocalDateTime uploadDate;

    @Column
    private String description;
}
