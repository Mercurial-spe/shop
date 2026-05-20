package com.example.shop_backend.service;

import com.example.shop_backend.model.*;
import com.example.shop_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditLogService {

    @Autowired
    private LoginLogRepository loginLogRepository;

    @Autowired
    private BrowseLogRepository browseLogRepository;

    @Autowired
    private PurchaseLogRepository purchaseLogRepository;

    @Autowired
    private OperationLogRepository operationLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public void logLogin(User user, String ipAddress) {
        LoginLog log = new LoginLog();
        log.setUserId(user.getId());
        log.setUsername(user.getUsername());
        log.setRole(user.getRole());
        log.setIpAddress(ipAddress);
        log.setCreatedAt(LocalDateTime.now());
        loginLogRepository.save(log);
    }

    public BrowseLog logBrowse(Long userId, Long productId, Integer durationSeconds, String ipAddress) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("商品不存在"));

        BrowseLog log = new BrowseLog();
        if (userId != null) {
            userRepository.findById(userId).ifPresent(user -> {
                log.setUserId(user.getId());
                log.setUsername(user.getUsername());
            });
        }
        log.setProductId(product.getId());
        log.setProductName(product.getName());
        log.setProductCategory(categoryOf(product));
        log.setDurationSeconds(durationSeconds == null ? 0 : Math.max(0, durationSeconds));
        log.setIpAddress(ipAddress);
        log.setCreatedAt(LocalDateTime.now());
        return browseLogRepository.save(log);
    }

    public void logPurchase(User user, Order order, OrderItem item) {
        Product product = item.getProduct();

        PurchaseLog log = new PurchaseLog();
        log.setUserId(user.getId());
        log.setUsername(user.getUsername());
        log.setOrderId(order.getId());
        log.setProductId(product.getId());
        log.setProductName(product.getName());
        log.setProductCategory(categoryOf(product));
        log.setUnitPrice(item.getPrice());
        log.setQuantity(item.getQuantity());
        log.setPurchasedAt(LocalDateTime.now());
        purchaseLogRepository.save(log);
    }

    public void logOperation(User actor, String action, String content, String ipAddress) {
        OperationLog log = new OperationLog();
        log.setActorId(actor.getId());
        log.setUsername(actor.getUsername());
        log.setRole(actor.getRole());
        log.setAction(action);
        log.setContent(content);
        log.setIpAddress(ipAddress);
        log.setCreatedAt(LocalDateTime.now());
        operationLogRepository.save(log);
    }

    public List<LoginLog> latestLoginLogs() {
        return loginLogRepository.findTop100ByOrderByCreatedAtDesc();
    }

    public List<BrowseLog> latestBrowseLogs() {
        return browseLogRepository.findTop100ByOrderByCreatedAtDesc();
    }

    public List<PurchaseLog> latestPurchaseLogs() {
        return purchaseLogRepository.findTop100ByOrderByPurchasedAtDesc();
    }

    public List<OperationLog> latestOperationLogs() {
        return operationLogRepository.findTop100ByOrderByCreatedAtDesc();
    }

    private String categoryOf(Product product) {
        if (product.getCategory() == null || product.getCategory().isBlank()) {
            return "未分类";
        }
        return product.getCategory();
    }
}
