package com.doctorapp.repository.impl;

import com.doctorapp.entity.Admin;
import com.doctorapp.exception.DuplicateResourceException;
import com.doctorapp.exception.ResourceNotFoundException;
import com.doctorapp.repository.IAdminRepository;
import com.doctorapp.repository.jpa.AdminJpaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class AdminRepositoryImpl implements IAdminRepository {

    @Autowired
    private AdminJpaRepository adminJpaRepository;

    @Override
    public Admin addAdmin(Admin admin) {
        if (adminJpaRepository.existsByEmail(admin.getEmail())) {
            throw new DuplicateResourceException("Admin", "email", admin.getEmail());
        }
        return adminJpaRepository.save(admin);
    }

    @Override
    public Admin updateAdmin(Admin admin) {
        adminJpaRepository.findById(admin.getAdminId())
                .orElseThrow(() -> new ResourceNotFoundException("Admin", "adminId", admin.getAdminId()));
        return adminJpaRepository.save(admin);
    }

    @Override
    public Admin removeAdmin(Admin admin) {
        Admin existing = adminJpaRepository.findById(admin.getAdminId())
                .orElseThrow(() -> new ResourceNotFoundException("Admin", "adminId", admin.getAdminId()));
        adminJpaRepository.delete(existing);
        return existing;
    }

    @Override
    public Admin viewAdmin(Admin admin) {
        return adminJpaRepository.findById(admin.getAdminId())
                .orElseThrow(() -> new ResourceNotFoundException("Admin", "adminId", admin.getAdminId()));
    }
}
