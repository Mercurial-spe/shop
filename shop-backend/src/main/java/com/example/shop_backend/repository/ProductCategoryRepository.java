package com.example.shop_backend.repository;

import com.example.shop_backend.model.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {
    List<ProductCategory> findAllByOrderByNameAsc();
    Optional<ProductCategory> findByNameIgnoreCase(String name);
}
