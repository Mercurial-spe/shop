package com.example.shop_backend.repository;

import com.example.shop_backend.model.Order;
import com.example.shop_backend.model.OrderStatus;
import com.example.shop_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);
    List<Order> findByStatusAndShippedAtBefore(OrderStatus status, LocalDateTime time);
}
