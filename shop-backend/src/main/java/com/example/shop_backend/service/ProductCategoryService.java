package com.example.shop_backend.service;

import com.example.shop_backend.model.ProductCategory;
import com.example.shop_backend.model.User;
import com.example.shop_backend.repository.ProductCategoryRepository;
import com.example.shop_backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductCategoryService {

    @Autowired
    private ProductCategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AccessControlService accessControlService;

    public List<ProductCategory> listCategories() {
        return categoryRepository.findAllByOrderByNameAsc();
    }

    public ProductCategory createCategory(Long sellerId, String rawName) {
        User seller = accessControlService.requireSeller(sellerId);
        String name = normalizeName(rawName);
        if (categoryRepository.findByNameIgnoreCase(name).isPresent()) {
            throw new RuntimeException("商品类别已存在");
        }

        ProductCategory category = new ProductCategory();
        category.setName(name);
        category.setCreatedById(seller.getId());
        category.setCreatedByUsername(seller.getUsername());
        category.setCreatedAt(LocalDateTime.now());
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long sellerId, Long categoryId) {
        accessControlService.requireSeller(sellerId);
        ProductCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("商品类别不存在"));
        if (productRepository.existsByCategory(category.getName())) {
            throw new RuntimeException("该类别仍有关联商品，不能直接删除");
        }
        categoryRepository.delete(category);
    }

    public void ensureCategory(String name, User creator) {
        String normalized = normalizeName(name);
        if (categoryRepository.findByNameIgnoreCase(normalized).isPresent()) {
            return;
        }
        ProductCategory category = new ProductCategory();
        category.setName(normalized);
        if (creator != null) {
            category.setCreatedById(creator.getId());
            category.setCreatedByUsername(creator.getUsername());
        }
        category.setCreatedAt(LocalDateTime.now());
        categoryRepository.save(category);
    }

    private String normalizeName(String rawName) {
        if (rawName == null || rawName.isBlank()) {
            throw new RuntimeException("商品类别不能为空");
        }
        String name = rawName.trim();
        if (name.length() > 30) {
            throw new RuntimeException("商品类别不能超过 30 个字符");
        }
        return name;
    }
}
