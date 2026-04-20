package com.doctorapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int appointmentId;

    // Many-to-One with Patient
    @NotNull(message = "Patient is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    // Many-to-One with Doctor
    @NotNull(message = "Doctor is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(nullable = false)
    private LocalDate appointmentDate;

    @Column
    private String appointmentStatus;

    @Column
    private String remark;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "time_slot_id")
    private TimeSlot timeSlot;

    @Column(nullable = false)
    private boolean reminder24hSent = false;

    @Column(nullable = false)
    private boolean reminder1hSent = false;
}
