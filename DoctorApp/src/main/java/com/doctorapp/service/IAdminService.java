package com.doctorapp.service;

import com.doctorapp.entity.Admin;

public interface IAdminService {

    Admin addAdmin(Admin admin);

    Admin updateAdmin(Admin admin);

    Admin removeAdmin(Admin admin);

    Admin viewAdmin(Admin admin);
}
