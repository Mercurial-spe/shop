package com.example.shop_backend.controller;

import com.example.shop_backend.model.ProductCategory;
import com.example.shop_backend.model.User;
import com.example.shop_backend.service.AccessControlService;
import com.example.shop_backend.service.AuditLogService;
import com.example.shop_backend.service.ProductCategoryService;
import com.example.shop_backend.util.RequestIpUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class ProductCategoryController {

    @Autowired
    private ProductCategoryService categoryService;

    @Autowired
    private AccessControlService accessControlService;

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<?> listCategories() {
        return ResponseEntity.ok(categoryService.listCategories());
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Map<String, String> payload, HttpServletRequest request) {
        try {
            Long sellerId = parseId(payload.get("sellerId"));
            User seller = accessControlService.requireSeller(sellerId);
            ProductCategory category = categoryService.createCategory(sellerId, payload.get("name"));
            auditLogService.logOperation(
                    seller,
                    "CATEGORY_CREATE",
                    "添加商品类别：" + category.getName(),
                    RequestIpUtil.clientIp(request)
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(category);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long categoryId, @RequestParam Long sellerId, HttpServletRequest request) {
        try {
            User seller = accessControlService.requireSeller(sellerId);
            ProductCategory category = categoryService.listCategories().stream()
                    .filter(item -> item.getId().equals(categoryId))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("商品类别不存在"));
            categoryService.deleteCategory(sellerId, categoryId);
            auditLogService.logOperation(
                    seller,
                    "CATEGORY_DELETE",
                    "删除商品类别：" + category.getName(),
                    RequestIpUtil.clientIp(request)
            );
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private Long parseId(String value) {
        if (value == null || value.isBlank()) {
            throw new RuntimeException("销售账号不存在");
        }
        return Long.parseLong(value);
    }
}
