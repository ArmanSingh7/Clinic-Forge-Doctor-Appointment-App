package com.doctorapp.repository;

import com.doctorapp.entity.Admin;

public interface IAdminRepository {

    Admin addAdmin(Admin admin);

    Admin updateAdmin(Admin admin);

    Admin removeAdmin(Admin admin);

    Admin viewAdmin(Admin admin);
}
