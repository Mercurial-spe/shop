package com.example.shop_backend.repository;

import com.example.shop_backend.model.OrderItem;
import com.example.shop_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    @Query("select item from OrderItem item where item.seller = :seller order by item.order.createdAt desc, item.id desc")
    List<OrderItem> findBySellerOrderByOrderCreatedAtDesc(@Param("seller") User seller);
}
