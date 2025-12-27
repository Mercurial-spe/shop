package com.example.shop_backend.repository;

import com.example.shop_backend.model.OrderItem;
import com.example.shop_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findBySeller(User seller);
}
