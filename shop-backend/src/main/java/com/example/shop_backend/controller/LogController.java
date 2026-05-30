package com.example.shop_backend.controller;

import com.example.shop_backend.model.Product;
import com.example.shop_backend.model.User;
import com.example.shop_backend.repository.ProductRepository;
import com.example.shop_backend.service.AccessControlService;
import com.example.shop_backend.service.AuditLogService;
import com.example.shop_backend.util.RequestIpUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private AccessControlService accessControlService;

    @Autowired
    private ProductRepository productRepository;

    @PostMapping("/browse")
    public ResponseEntity<?> recordBrowse(@RequestBody Map<String, Long> payload, HttpServletRequest request) {
        try {
            Long userId = payload.get("userId");
            Long productId = payload.get("productId");
            Long duration = payload.getOrDefault("durationSeconds", 0L);
            if (productId == null) {
                return ResponseEntity.badRequest().body("商品不存在");
            }
            return ResponseEntity.ok(auditLogService.logBrowse(
                    userId,
                    productId,
                    duration.intValue(),
                    RequestIpUtil.clientIp(request)
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/login")
    public ResponseEntity<?> loginLogs(@RequestParam Long adminId) {
        try {
            accessControlService.requireAdmin(adminId);
            return ResponseEntity.ok(auditLogService.latestLoginLogs());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/browse")
    public ResponseEntity<?> browseLogs(@RequestParam Long adminId) {
        try {
            accessControlService.requireAdmin(adminId);
            return ResponseEntity.ok(auditLogService.latestBrowseLogs());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/purchase")
    public ResponseEntity<?> purchaseLogs(@RequestParam Long adminId) {
        try {
            accessControlService.requireAdmin(adminId);
            return ResponseEntity.ok(auditLogService.latestPurchaseLogs());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/operation")
    public ResponseEntity<?> operationLogs(@RequestParam Long adminId) {
        try {
            accessControlService.requireAdmin(adminId);
            return ResponseEntity.ok(auditLogService.latestOperationLogs());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<?> logSummary(@RequestParam Long adminId) {
        try {
            accessControlService.requireAdmin(adminId);
            return ResponseEntity.ok(auditLogService.logSummary());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/seller/browse")
    public ResponseEntity<?> sellerBrowseLogs(@RequestParam Long sellerId) {
        try {
            return ResponseEntity.ok(auditLogService.browseLogsForProducts(sellerProductIds(sellerId)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/seller/purchase")
    public ResponseEntity<?> sellerPurchaseLogs(@RequestParam Long sellerId) {
        try {
            return ResponseEntity.ok(auditLogService.purchaseLogsForProducts(sellerProductIds(sellerId)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** 销售人员只能查看自己发布商品的日志：先解析其商品 ID 集合。 */
    private List<Long> sellerProductIds(Long sellerId) {
        User seller = accessControlService.requireSeller(sellerId);
        return productRepository.findBySeller(seller).stream()
                .map(Product::getId)
                .filter(java.util.Objects::nonNull)
                .toList();
    }
}
