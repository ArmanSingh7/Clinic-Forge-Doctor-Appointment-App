package com.doctorapp.service.impl;

import com.doctorapp.entity.Admin;
import com.doctorapp.repository.IAdminRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceImplTest {

    @InjectMocks
    private AdminServiceImpl adminService;

    @Mock
    private IAdminRepository adminRepository;

    private Admin testAdmin;

    @BeforeEach
    void setUp() {
        testAdmin = new Admin();
        testAdmin.setAdminId(1);
        testAdmin.setAdminName("Super Admin");
        testAdmin.setContactNumber("9876543210");
        testAdmin.setEmail("admin@test.com");
        testAdmin.setPassword("encoded");
    }

    @Test
    @DisplayName("Should add a new admin")
    void shouldAddAdmin() {
        when(adminRepository.addAdmin(any(Admin.class))).thenReturn(testAdmin);

        Admin result = adminService.addAdmin(testAdmin);

        assertThat(result).isNotNull();
        assertThat(result.getAdminName()).isEqualTo("Super Admin");
        assertThat(result.getEmail()).isEqualTo("admin@test.com");
        verify(adminRepository).addAdmin(testAdmin);
    }

    @Test
    @DisplayName("Should update admin details")
    void shouldUpdateAdmin() {
        testAdmin.setContactNumber("1111111111");
        when(adminRepository.updateAdmin(any(Admin.class))).thenReturn(testAdmin);

        Admin result = adminService.updateAdmin(testAdmin);

        assertThat(result.getContactNumber()).isEqualTo("1111111111");
        verify(adminRepository).updateAdmin(testAdmin);
    }

    @Test
    @DisplayName("Should remove an admin")
    void shouldRemoveAdmin() {
        when(adminRepository.removeAdmin(any(Admin.class))).thenReturn(testAdmin);

        Admin result = adminService.removeAdmin(testAdmin);

        assertThat(result).isNotNull();
        assertThat(result.getAdminId()).isEqualTo(1);
        verify(adminRepository).removeAdmin(testAdmin);
    }

    @Test
    @DisplayName("Should view admin by probe")
    void shouldViewAdmin() {
        Admin probe = new Admin();
        probe.setAdminId(1);
        when(adminRepository.viewAdmin(probe)).thenReturn(testAdmin);

        Admin result = adminService.viewAdmin(probe);

        assertThat(result.getAdminName()).isEqualTo("Super Admin");
        verify(adminRepository).viewAdmin(probe);
    }
}
