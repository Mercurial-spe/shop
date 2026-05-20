package com.example.shop_backend.controller;

import com.example.shop_backend.model.User;
import com.example.shop_backend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/sellers")
    public ResponseEntity<?> listSellers(@RequestParam Long adminId) {
        try {
            return ResponseEntity.ok(adminService.listSellers(adminId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @PostMapping("/sellers")
    public ResponseEntity<?> createSeller(@RequestBody Map<String, String> payload) {
        try {
            Long adminId = parseId(payload.get("adminId"));
            User seller = adminService.createSeller(
                    adminId,
                    payload.get("username"),
                    payload.get("email"),
                    payload.get("password")
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(seller);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/sellers/{sellerId}")
    public ResponseEntity<?> deleteSeller(@PathVariable Long sellerId, @RequestParam Long adminId) {
        try {
            adminService.deleteSeller(adminId, sellerId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/sellers/{sellerId}/reset-password")
    public ResponseEntity<?> resetSellerPassword(@PathVariable Long sellerId, @RequestBody Map<String, String> payload) {
        try {
            Long adminId = parseId(payload.get("adminId"));
            User seller = adminService.resetSellerPassword(adminId, sellerId, payload.get("password"));
            return ResponseEntity.ok(seller);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private Long parseId(String value) {
        if (value == null || value.isBlank()) {
            throw new RuntimeException("管理员账号不存在");
        }
        return Long.parseLong(value);
    }
}
