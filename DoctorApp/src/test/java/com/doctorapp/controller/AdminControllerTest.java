package com.doctorapp.controller;

import com.doctorapp.entity.Admin;
import com.doctorapp.service.IAdminService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private AdminController adminController;

    @Mock
    private IAdminService adminService;

    private Admin testAdmin;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminController).build();

        testAdmin = new Admin();
        testAdmin.setAdminId(1);
        testAdmin.setAdminName("Super Admin");
        testAdmin.setContactNumber("9876543210");
        testAdmin.setEmail("admin@test.com");
        testAdmin.setPassword("encoded");
    }

    @Test
    @DisplayName("POST /api/admins/add - Should add admin")
    void shouldAddAdmin() throws Exception {
        when(adminService.addAdmin(any(Admin.class))).thenReturn(testAdmin);

        mockMvc.perform(post("/api/admins/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testAdmin)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value(201))
                .andExpect(jsonPath("$.data.adminName").value("Super Admin"));
    }

    @Test
    @DisplayName("PUT /api/admins/update - Should update admin")
    void shouldUpdateAdmin() throws Exception {
        testAdmin.setContactNumber("1111111111");
        when(adminService.updateAdmin(any(Admin.class))).thenReturn(testAdmin);

        mockMvc.perform(put("/api/admins/update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testAdmin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.contactNumber").value("1111111111"));
    }

    @Test
    @DisplayName("DELETE /api/admins/remove - Should remove admin")
    void shouldRemoveAdmin() throws Exception {
        when(adminService.removeAdmin(any(Admin.class))).thenReturn(testAdmin);

        mockMvc.perform(delete("/api/admins/remove")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testAdmin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Admin removed successfully"));
    }

    @Test
    @DisplayName("GET /api/admins/{id} - Should get admin by ID")
    void shouldGetAdminById() throws Exception {
        when(adminService.viewAdmin(any(Admin.class))).thenReturn(testAdmin);

        mockMvc.perform(get("/api/admins/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.adminName").value("Super Admin"))
                .andExpect(jsonPath("$.data.email").value("admin@test.com"));
    }
}
