package com.example.shop_backend.controller;

import com.example.shop_backend.controller.dto.ProductRequest;
import com.example.shop_backend.model.Product;
import com.example.shop_backend.service.AuditLogService;
import com.example.shop_backend.service.OrderService;
import com.example.shop_backend.service.ProductService;
import com.example.shop_backend.util.RequestIpUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<?> getProductsBySeller(@PathVariable Long sellerId) {
        try {
            return ResponseEntity.ok(productService.getProductsBySeller(sellerId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody ProductRequest request, HttpServletRequest httpRequest) {
        try {
            Product product = new Product();
            product.setName(request.getName());
            product.setDescription(request.getDescription());
            product.setPrice(request.getPrice());
            product.setCategory(request.getCategory());
            product.setImageUrl(request.getImageUrl());
            product.setStockQuantity(request.getStockQuantity());
            Product created = productService.createProduct(product, request.getSellerId());
            auditLogService.logOperation(
                    created.getSeller(),
                    "PRODUCT_CREATE",
                    "发布商品：" + created.getName(),
                    RequestIpUtil.clientIp(httpRequest)
            );
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody ProductRequest request, HttpServletRequest httpRequest) {
        try {
            Product productDetails = new Product();
            productDetails.setName(request.getName());
            productDetails.setDescription(request.getDescription());
            productDetails.setPrice(request.getPrice());
            productDetails.setCategory(request.getCategory());
            productDetails.setImageUrl(request.getImageUrl());
            productDetails.setStockQuantity(request.getStockQuantity());
            return productService.updateProduct(id, productDetails, request.getSellerId())
                    .map(product -> {
                        auditLogService.logOperation(
                                product.getSeller(),
                                "PRODUCT_UPDATE",
                                "修改商品：" + product.getName(),
                                RequestIpUtil.clientIp(httpRequest)
                        );
                        return ResponseEntity.ok(product);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, @RequestParam Long sellerId, HttpServletRequest httpRequest) {
        try {
            Product productBeforeDelete = productService.getProductById(id).orElse(null);
            if (productService.deleteProduct(id, sellerId)) {
                if (productBeforeDelete != null) {
                    auditLogService.logOperation(
                            productBeforeDelete.getSeller(),
                            "PRODUCT_DELETE",
                            "删除商品：" + productBeforeDelete.getName(),
                            RequestIpUtil.clientIp(httpRequest)
                    );
                }
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/purchase")
    public ResponseEntity<?> purchaseProduct(@PathVariable Long id, @RequestBody Map<String, Integer> payload) {
        Integer quantity = payload.getOrDefault("quantity", 1);
        Integer userId = payload.get("userId");
        if (userId == null) {
            return ResponseEntity.badRequest().body("用户不存在");
        }
        try {
            return ResponseEntity.ok(orderService.purchaseSingle(userId.longValue(), id, quantity));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
