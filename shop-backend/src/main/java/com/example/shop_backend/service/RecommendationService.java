package com.example.shop_backend.service;

import com.example.shop_backend.model.BrowseLog;
import com.example.shop_backend.model.Product;
import com.example.shop_backend.model.PurchaseLog;
import com.example.shop_backend.model.User;
import com.example.shop_backend.repository.BrowseLogRepository;
import com.example.shop_backend.repository.ProductRepository;
import com.example.shop_backend.repository.PurchaseLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private AccessControlService accessControlService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PurchaseLogRepository purchaseLogRepository;

    @Autowired
    private BrowseLogRepository browseLogRepository;

    public List<Map<String, Object>> recommendForUser(Long userId, int limit) {
        User user = accessControlService.requireCustomer(userId);
        List<Product> products = productRepository.findAll();
        List<PurchaseLog> purchases = purchaseLogRepository.findAll();
        List<BrowseLog> browses = browseLogRepository.findAll();

        Set<String> preferredCategories = preferredCategories(user.getId(), purchases, browses);
        Map<Long, Double> popularityScores = popularityScores(purchases, browses);

        return products.stream()
                .sorted(Comparator.comparingDouble((Product product) -> recommendationScore(product, preferredCategories, popularityScores)).reversed())
                .limit(normalizeLimit(limit))
                .map(product -> productCard(product, reasonFor(product, preferredCategories, "结合你的浏览/购买偏好推荐")))
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> relatedProducts(Long productId, Integer userId, int limit) {
        Product seed = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("商品不存在"));
        List<Product> products = productRepository.findAll();
        List<PurchaseLog> purchases = purchaseLogRepository.findAll();
        List<BrowseLog> browses = browseLogRepository.findAll();
        Map<Long, Double> popularityScores = popularityScores(purchases, browses);

        Set<Long> similarUsers = purchases.stream()
                .filter(log -> Objects.equals(log.getProductId(), productId))
                .map(PurchaseLog::getUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Long, Long> coPurchaseCounts = purchases.stream()
                .filter(log -> similarUsers.contains(log.getUserId()))
                .filter(log -> !Objects.equals(log.getProductId(), productId))
                .filter(log -> log.getProductId() != null)
                .collect(Collectors.groupingBy(PurchaseLog::getProductId, Collectors.counting()));
        Set<String> userCategories = userId == null ? Set.of() : preferredCategories(userId.longValue(), purchases, browses);

        return products.stream()
                .filter(product -> !Objects.equals(product.getId(), productId))
                .sorted(Comparator.comparingDouble((Product product) -> relatedScore(seed, product, userCategories, coPurchaseCounts, popularityScores)).reversed())
                .limit(normalizeLimit(limit))
                .map(product -> productCard(product, reasonForRelated(seed, product, coPurchaseCounts)))
                .collect(Collectors.toList());
    }

    private double recommendationScore(Product product, Set<String> preferredCategories, Map<Long, Double> popularityScores) {
        double score = popularityScores.getOrDefault(product.getId(), 0.0);
        if (product.getCategory() != null && preferredCategories.contains(product.getCategory())) {
            score += 100.0;
        }
        if (product.getStockQuantity() != null && product.getStockQuantity() <= 0) {
            score -= 50.0;
        }
        return score;
    }

    private double relatedScore(
            Product seed,
            Product product,
            Set<String> userCategories,
            Map<Long, Long> coPurchaseCounts,
            Map<Long, Double> popularityScores
    ) {
        double score = popularityScores.getOrDefault(product.getId(), 0.0);
        score += coPurchaseCounts.getOrDefault(product.getId(), 0L) * 80.0;
        if (Objects.equals(seed.getCategory(), product.getCategory())) {
            score += 60.0;
        }
        if (product.getCategory() != null && userCategories.contains(product.getCategory())) {
            score += 30.0;
        }
        return score;
    }

    private Set<String> preferredCategories(Long userId, List<PurchaseLog> purchases, List<BrowseLog> browses) {
        Map<String, Long> categoryScores = new HashMap<>();
        purchases.stream()
                .filter(log -> Objects.equals(log.getUserId(), userId))
                .filter(log -> log.getProductCategory() != null)
                .forEach(log -> categoryScores.merge(log.getProductCategory(), 5L, Long::sum));
        browses.stream()
                .filter(log -> Objects.equals(log.getUserId(), userId))
                .filter(log -> log.getProductCategory() != null)
                .forEach(log -> categoryScores.merge(log.getProductCategory(), 1L, Long::sum));

        return categoryScores.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(2)
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());
    }

    private Map<Long, Double> popularityScores(List<PurchaseLog> purchases, List<BrowseLog> browses) {
        Map<Long, Double> scores = new HashMap<>();
        purchases.stream()
                .filter(log -> log.getProductId() != null)
                .forEach(log -> scores.merge(log.getProductId(), valueOrZero(log.getQuantity()) * 12.0, Double::sum));
        browses.stream()
                .filter(log -> log.getProductId() != null)
                .forEach(log -> scores.merge(log.getProductId(), 1.0, Double::sum));
        return scores;
    }

    private String reasonFor(Product product, Set<String> preferredCategories, String fallback) {
        if (product.getCategory() != null && preferredCategories.contains(product.getCategory())) {
            return "你近期偏好“" + product.getCategory() + "”";
        }
        return fallback;
    }

    private String reasonForRelated(Product seed, Product product, Map<Long, Long> coPurchaseCounts) {
        if (coPurchaseCounts.getOrDefault(product.getId(), 0L) > 0) {
            return "购买过当前商品的顾客也购买过";
        }
        if (Objects.equals(seed.getCategory(), product.getCategory())) {
            return "同类商品推荐";
        }
        return "综合热度推荐";
    }

    private Map<String, Object> productCard(Product product, String reason) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", product.getId());
        result.put("name", product.getName());
        result.put("description", product.getDescription());
        result.put("price", product.getPrice());
        result.put("category", product.getCategory());
        result.put("imageUrl", product.getImageUrl());
        result.put("stockQuantity", product.getStockQuantity());
        result.put("reason", reason);
        if (product.getSeller() != null) {
            result.put("sellerId", product.getSeller().getId());
            result.put("sellerName", product.getSeller().getUsername());
        }
        return result;
    }

    private int normalizeLimit(int limit) {
        if (limit <= 0) {
            return 6;
        }
        return Math.min(limit, 20);
    }

    private int valueOrZero(Integer value) {
        return value == null ? 0 : value;
    }
}
