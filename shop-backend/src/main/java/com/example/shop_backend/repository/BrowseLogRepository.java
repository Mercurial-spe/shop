package com.example.shop_backend.repository;

import com.example.shop_backend.model.BrowseLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrowseLogRepository extends JpaRepository<BrowseLog, Long> {
    List<BrowseLog> findTop100ByOrderByCreatedAtDesc();
}
