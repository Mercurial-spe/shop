package com.example.shop_backend.repository;

import com.example.shop_backend.model.LoginLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoginLogRepository extends JpaRepository<LoginLog, Long> {
    List<LoginLog> findTop100ByOrderByCreatedAtDesc();
}
