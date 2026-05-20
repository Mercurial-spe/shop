package com.example.shop_backend.repository;

import com.example.shop_backend.model.PurchaseLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseLogRepository extends JpaRepository<PurchaseLog, Long> {
    List<PurchaseLog> findTop100ByOrderByPurchasedAtDesc();
}
