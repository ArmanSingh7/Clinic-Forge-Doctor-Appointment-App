package com.doctorapp.service.impl;

import com.doctorapp.entity.Admin;
import com.doctorapp.repository.IAdminRepository;
import com.doctorapp.service.IAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdminServiceImpl implements IAdminService {

    @Autowired
    private IAdminRepository adminRepository;

    @Override
    public Admin addAdmin(Admin admin) {
        return adminRepository.addAdmin(admin);
    }

    @Override
    public Admin updateAdmin(Admin admin) {
        return adminRepository.updateAdmin(admin);
    }

    @Override
    public Admin removeAdmin(Admin admin) {
        return adminRepository.removeAdmin(admin);
    }

    @Override
    @Transactional(readOnly = true)
    public Admin viewAdmin(Admin admin) {
        return adminRepository.viewAdmin(admin);
    }
}
