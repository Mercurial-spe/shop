package com.example.shop_backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "operation_logs")
@Data
public class OperationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long actorId;

    private String username;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    private String action;

    @Column(length = 1000)
    private String content;

    private String ipAddress;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
