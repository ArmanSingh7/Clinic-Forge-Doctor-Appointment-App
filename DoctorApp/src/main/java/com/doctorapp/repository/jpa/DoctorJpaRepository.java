package com.doctorapp.repository.jpa;

import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorJpaRepository extends JpaRepository<Doctor, Integer> {

    List<Doctor> findBySpeciality(String speciality);

    Optional<Doctor> findByEmailAndPassword(String email, String password);

    boolean existsByEmail(String email);

    Optional<Doctor> findByUser(User user);

    Optional<Doctor> findByMobileNo(String mobileNo);

    Optional<Doctor> findByEmail(String email);

    List<Doctor> findByCity(String city);

    List<Doctor> findByCityAndSpeciality(String city, String speciality);
}
