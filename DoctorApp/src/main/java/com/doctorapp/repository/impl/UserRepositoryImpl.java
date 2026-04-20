package com.doctorapp.repository.impl;

import com.doctorapp.entity.User;
import com.doctorapp.exception.DuplicateResourceException;
import com.doctorapp.exception.InvalidCredentialsException;
import com.doctorapp.exception.ResourceNotFoundException;
import com.doctorapp.repository.IUserRepository;
import com.doctorapp.repository.jpa.UserJpaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepositoryImpl implements IUserRepository {

    @Autowired
    private UserJpaRepository userJpaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public User validateUser(User user) {
        User found = userJpaRepository.findByUserName(user.getUserName())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(user.getPassword(), found.getPassword())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        return found;
    }

    @Override
    public User addUser(User user) {
        if (userJpaRepository.existsByUserName(user.getUserName())) {
            throw new DuplicateResourceException("User", "userName", user.getUserName());
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userJpaRepository.save(user);
    }

    @Override
    public User removeUser(User user) {
        User existing = userJpaRepository.findById(user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", user.getUserId()));
        userJpaRepository.delete(existing);
        return existing;
    }

    @Override
    public User updateUser(User user) {
        userJpaRepository.findById(user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", user.getUserId()));
        return userJpaRepository.save(user);
    }
}
