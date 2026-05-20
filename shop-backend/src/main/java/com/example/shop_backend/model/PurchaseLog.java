package com.example.shop_backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_logs")
@Data
public class PurchaseLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String username;

    private Long orderId;

    private Long productId;

    private String productName;

    private String productCategory;

    private Double unitPrice;

    private Integer quantity;

    @Column(nullable = false)
    private LocalDateTime purchasedAt;
}
