package com.doctorapp.controller;

import com.doctorapp.dto.ApiResponse;
import com.doctorapp.entity.Admin;
import com.doctorapp.service.IAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admins")
@Tag(name = "Admin Module", description = "Admin management operations")
public class AdminController {

    @Autowired
    private IAdminService adminService;

    @Operation(summary = "Add a new admin")
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<Admin>> addAdmin(@Valid @RequestBody Admin admin) {
        Admin created = adminService.addAdmin(admin);
        return new ResponseEntity<>(ApiResponse.created("Admin added successfully", created), HttpStatus.CREATED);
    }

    @Operation(summary = "Update admin details")
    @PutMapping("/update")
    public ResponseEntity<ApiResponse<Admin>> updateAdmin(@Valid @RequestBody Admin admin) {
        Admin updated = adminService.updateAdmin(admin);
        return ResponseEntity.ok(ApiResponse.success("Admin updated successfully", updated));
    }

    @Operation(summary = "Remove an admin")
    @DeleteMapping("/remove")
    public ResponseEntity<ApiResponse<Admin>> removeAdmin(@RequestBody Admin admin) {
        Admin removed = adminService.removeAdmin(admin);
        return ResponseEntity.ok(ApiResponse.deleted("Admin removed successfully", removed));
    }

    @Operation(summary = "View admin by request body")
    @GetMapping("/view")
    public ResponseEntity<ApiResponse<Admin>> viewAdmin(@RequestBody Admin admin) {
        Admin found = adminService.viewAdmin(admin);
        return ResponseEntity.ok(ApiResponse.success("Admin retrieved successfully", found));
    }

    @Operation(summary = "View admin by ID")
    @GetMapping("/{adminId}")
    public ResponseEntity<ApiResponse<Admin>> viewAdminById(@PathVariable int adminId) {
        Admin probe = new Admin();
        probe.setAdminId(adminId);
        Admin found = adminService.viewAdmin(probe);
        return ResponseEntity.ok(ApiResponse.success("Admin retrieved successfully", found));
    }
}
