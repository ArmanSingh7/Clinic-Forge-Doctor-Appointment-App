package com.doctorapp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "availability_dates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityDates {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int availabilityId;

    // Many-to-One with Doctor
    @NotNull(message = "Doctor is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(nullable = false)
    private LocalDate fromDate;

    @Column(nullable = false)
    private LocalDate endDate;
}
