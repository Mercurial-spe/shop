package com.example.shop_backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "login_logs")
@Data
public class LoginLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String username;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    private String ipAddress;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
