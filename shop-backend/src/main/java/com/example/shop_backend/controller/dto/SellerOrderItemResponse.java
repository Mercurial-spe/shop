package com.example.shop_backend.controller.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SellerOrderItemResponse {
    private Long orderId;
    private String orderStatus;
    private LocalDateTime orderCreatedAt;
    private Long productId;
    private String productName;
    private Integer quantity;
    private Double price;
    private Long buyerId;
    private String buyerName;
}
