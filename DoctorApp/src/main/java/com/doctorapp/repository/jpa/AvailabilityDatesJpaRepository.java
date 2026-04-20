package com.doctorapp.repository.jpa;

import com.doctorapp.entity.AvailabilityDates;
import com.doctorapp.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvailabilityDatesJpaRepository extends JpaRepository<AvailabilityDates, Integer> {

    List<AvailabilityDates> findByDoctor(Doctor doctor);
}
