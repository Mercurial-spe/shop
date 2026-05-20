package com.example.shop_backend.controller;

import com.example.shop_backend.model.Order;
import com.example.shop_backend.controller.dto.SellerOrderItemResponse;
import com.example.shop_backend.model.OrderItem;
import com.example.shop_backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getOrdersByUser(@PathVariable Long userId) {
        try {
            List<Order> orders = orderService.getOrdersByUser(userId);
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{orderId}/user/{userId}")
    public ResponseEntity<?> getOrderDetail(@PathVariable Long orderId, @PathVariable Long userId) {
        try {
            Order order = orderService.getOrderForUser(orderId, userId);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{orderId}/pay")
    public ResponseEntity<?> payOrder(@PathVariable Long orderId, @RequestBody Map<String, Object> payload) {
        try {
            Object userIdValue = payload.get("userId");
            String userIdText = userIdValue == null ? null : userIdValue.toString();
            if (userIdText == null || userIdText.isBlank()) {
                return ResponseEntity.badRequest().body("用户不存在");
            }
            Object paymentMethodValue = payload.getOrDefault("paymentMethod", "模拟支付");
            String paymentMethod = paymentMethodValue == null ? "模拟支付" : paymentMethodValue.toString();
            Order order = orderService.payOrder(orderId, Long.parseLong(userIdText), paymentMethod);
            return ResponseEntity.ok(order);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("用户不存在");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<?> getOrdersBySeller(@PathVariable Long sellerId) {
        try {
            List<OrderItem> items = orderService.getOrdersBySeller(sellerId);
            List<SellerOrderItemResponse> response = items.stream().map(item -> {
                SellerOrderItemResponse dto = new SellerOrderItemResponse();
                dto.setOrderId(item.getOrder().getId());
                dto.setOrderStatus(item.getOrder().getStatus().name());
                dto.setOrderCreatedAt(item.getOrder().getCreatedAt());
                dto.setProductId(item.getProduct().getId());
                dto.setProductName(item.getProduct().getName());
                dto.setQuantity(item.getQuantity());
                dto.setPrice(item.getPrice());
                dto.setBuyerId(item.getOrder().getUser().getId());
                dto.setBuyerName(item.getOrder().getUser().getUsername());
                return dto;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/seller/{sellerId}/stats")
    public ResponseEntity<?> getSellerStats(@PathVariable Long sellerId) {
        try {
            Map<String, Object> stats = orderService.getSellerStats(sellerId);
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
