package com.example.shop_backend.controller.dto;

import lombok.Data;

@Data
public class ProductRequest {
    private String name;
    private String description;
    private Double price;
    private String imageUrl;
    private Integer stockQuantity;
    private Long sellerId;
}
