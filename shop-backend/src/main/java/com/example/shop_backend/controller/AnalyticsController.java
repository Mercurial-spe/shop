package com.example.shop_backend.controller;

import com.example.shop_backend.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/admin/overview")
    public ResponseEntity<?> overview(@RequestParam Long adminId) {
        try {
            return ResponseEntity.ok(analyticsService.overview(adminId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/admin/rankings")
    public ResponseEntity<?> rankings(@RequestParam Long adminId) {
        try {
            return ResponseEntity.ok(analyticsService.rankings(adminId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/admin/trends")
    public ResponseEntity<?> trends(@RequestParam Long adminId, @RequestParam(defaultValue = "day") String period) {
        try {
            return ResponseEntity.ok(analyticsService.trends(adminId, period));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/admin/anomalies")
    public ResponseEntity<?> anomalies(@RequestParam Long adminId) {
        try {
            return ResponseEntity.ok(analyticsService.anomalies(adminId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/admin/customer-profiles")
    public ResponseEntity<?> customerProfiles(@RequestParam Long adminId) {
        try {
            return ResponseEntity.ok(analyticsService.customerProfiles(adminId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
