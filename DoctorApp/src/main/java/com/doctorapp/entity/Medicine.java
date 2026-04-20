package com.doctorapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "medicines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int medicineId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @NotBlank(message = "Medicine name is required")
    @Column(nullable = false)
    private String medicineName;

    @Column
    private String dosage;

    @Column
    private String frequency;

    @Column
    private String duration;

    @Column
    private String notes;
}
