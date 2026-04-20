package com.doctorapp.repository.jpa;

import com.doctorapp.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenJpaRepository extends JpaRepository<PasswordResetToken, Integer> {

    Optional<PasswordResetToken> findByToken(String token);
}
