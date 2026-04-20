package com.doctorapp.repository.jpa;

import com.doctorapp.entity.Appointment;
import com.doctorapp.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineJpaRepository extends JpaRepository<Medicine, Integer> {

    List<Medicine> findByAppointment(Appointment appointment);
}
