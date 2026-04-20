package com.doctorapp.repository.jpa;

import com.doctorapp.entity.Admin;
import com.doctorapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminJpaRepository extends JpaRepository<Admin, Integer> {

    Optional<Admin> findByEmailAndPassword(String email, String password);

    boolean existsByEmail(String email);

    Optional<Admin> findByUser(User user);

    Optional<Admin> findByEmail(String email);
}
