package com.example.shop_backend.repository;

import com.example.shop_backend.model.OperationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OperationLogRepository extends JpaRepository<OperationLog, Long> {
    List<OperationLog> findTop100ByOrderByCreatedAtDesc();
}
