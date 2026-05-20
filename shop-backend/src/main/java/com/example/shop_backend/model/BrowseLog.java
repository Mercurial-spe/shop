package com.example.shop_backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "browse_logs")
@Data
public class BrowseLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String username;

    @Column(nullable = false)
    private Long productId;

    private String productName;

    private String productCategory;

    private Integer durationSeconds;

    private String ipAddress;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
