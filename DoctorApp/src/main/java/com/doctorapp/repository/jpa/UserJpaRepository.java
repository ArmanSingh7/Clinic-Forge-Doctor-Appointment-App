package com.doctorapp.repository.jpa;

import com.doctorapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserJpaRepository extends JpaRepository<User, Integer> {

    Optional<User> findByUserName(String userName);

    boolean existsByUserName(String userName);
}
