package com.example.shop_backend.controller;

import com.example.shop_backend.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> recommendForUser(@PathVariable Long userId, @RequestParam(defaultValue = "6") int limit) {
        try {
            return ResponseEntity.ok(recommendationService.recommendForUser(userId, limit));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/products/{productId}/related")
    public ResponseEntity<?> relatedProducts(
            @PathVariable Long productId,
            @RequestParam(required = false) Integer userId,
            @RequestParam(defaultValue = "6") int limit
    ) {
        try {
            return ResponseEntity.ok(recommendationService.relatedProducts(productId, userId, limit));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
