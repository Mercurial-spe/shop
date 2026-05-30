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
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 推荐服务。课程要求两类推荐：
 * 1. 协同过滤推荐：基于「用户-商品购买矩阵」计算 item-item 余弦相似度，
 *    为用户已购买/浏览过的商品找出最相似的其它商品（item-based CF）。
 * 2. 简单推荐「浏览过此商品的人也买了」：以浏览日志找出浏览过种子商品的用户群，
 *    再统计这群人实际购买过的其它商品。
 * 当行为数据不足（冷启动）时，回退到「同类 + 全局热度 + 个人偏好」的内容型规则，保证总有结果。
 */
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

        // 协同过滤主信号：用户已经接触（购买或浏览）过的商品集合，
        // 通过 item-item 相似度向尚未购买的商品扩散打分。
        Set<Long> seedItems = userItemHistory(user.getId(), purchases, browses);
        Set<Long> purchasedItems = userPurchasedItems(user.getId(), purchases);
        Map<Long, Set<Long>> usersByItem = usersByItem(purchases);
        Map<Long, Double> cfScores = collaborativeScores(seedItems, purchasedItems, usersByItem);
        double maxCf = cfScores.values().stream().mapToDouble(Double::doubleValue).max().orElse(0.0);

        return products.stream()
                .filter(product -> product.getId() != null)
                .filter(product -> !purchasedItems.contains(product.getId()))
                .sorted(Comparator.comparingDouble((Product product) ->
                        hybridScore(product, preferredCategories, popularityScores, cfScores)).reversed())
                .limit(normalizeLimit(limit))
                .map(product -> productCard(product,
                        reasonForUser(product, preferredCategories, cfScores, maxCf)))
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> relatedProducts(Long productId, Integer userId, int limit) {
        Product seed = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("商品不存在"));
        List<Product> products = productRepository.findAll();
        List<PurchaseLog> purchases = purchaseLogRepository.findAll();
        List<BrowseLog> browses = browseLogRepository.findAll();
        Map<Long, Double> popularityScores = popularityScores(purchases, browses);

        // 「浏览过此商品的人也买了」：先用浏览日志找出浏览过种子商品的用户，
        // 再统计这群人买过哪些其它商品。
        Set<Long> viewers = browses.stream()
                .filter(log -> Objects.equals(log.getProductId(), productId))
                .map(BrowseLog::getUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Long, Long> viewerBought = purchases.stream()
                .filter(log -> viewers.contains(log.getUserId()))
                .filter(log -> log.getProductId() != null)
                .filter(log -> !Objects.equals(log.getProductId(), productId))
                .collect(Collectors.groupingBy(PurchaseLog::getProductId, Collectors.counting()));

        // item-item 协同过滤相似度：购买过种子商品的用户与购买候选商品用户的余弦相似度。
        Map<Long, Set<Long>> usersByItem = usersByItem(purchases);
        Map<Long, Double> itemSimilarity = itemSimilarityTo(productId, usersByItem);

        Set<String> userCategories = userId == null ? Set.of() : preferredCategories(userId.longValue(), purchases, browses);

        return products.stream()
                .filter(product -> !Objects.equals(product.getId(), productId))
                .sorted(Comparator.comparingDouble((Product product) ->
                        relatedScore(seed, product, userCategories, viewerBought, itemSimilarity, popularityScores)).reversed())
                .limit(normalizeLimit(limit))
                .map(product -> productCard(product, reasonForRelated(seed, product, viewerBought, itemSimilarity)))
                .collect(Collectors.toList());
    }

    /** 用户接触过的商品集合（购买权重高，浏览也算），作为协同过滤的种子。 */
    private Set<Long> userItemHistory(Long userId, List<PurchaseLog> purchases, List<BrowseLog> browses) {
        Set<Long> items = new HashSet<>(userPurchasedItems(userId, purchases));
        browses.stream()
                .filter(log -> Objects.equals(log.getUserId(), userId))
                .map(BrowseLog::getProductId)
                .filter(Objects::nonNull)
                .forEach(items::add);
        return items;
    }

    private Set<Long> userPurchasedItems(Long userId, List<PurchaseLog> purchases) {
        return purchases.stream()
                .filter(log -> Objects.equals(log.getUserId(), userId))
                .map(PurchaseLog::getProductId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    /** 倒排索引：商品 -> 购买过它的用户集合。item-item 相似度的基础。 */
    private Map<Long, Set<Long>> usersByItem(List<PurchaseLog> purchases) {
        Map<Long, Set<Long>> usersByItem = new HashMap<>();
        for (PurchaseLog log : purchases) {
            if (log.getProductId() == null || log.getUserId() == null) {
                continue;
            }
            usersByItem.computeIfAbsent(log.getProductId(), key -> new HashSet<>()).add(log.getUserId());
        }
        return usersByItem;
    }

    /**
     * item-based 协同过滤打分：对用户种子商品集合中的每个商品 i，
     * 累加它与候选商品 j 的余弦相似度，得到候选商品的协同过滤得分。
     */
    private Map<Long, Double> collaborativeScores(Set<Long> seedItems, Set<Long> purchasedItems, Map<Long, Set<Long>> usersByItem) {
        Map<Long, Double> scores = new HashMap<>();
        for (Long seedItem : seedItems) {
            Set<Long> seedUsers = usersByItem.get(seedItem);
            if (seedUsers == null || seedUsers.isEmpty()) {
                continue;
            }
            for (Map.Entry<Long, Set<Long>> entry : usersByItem.entrySet()) {
                Long candidate = entry.getKey();
                if (seedItems.contains(candidate) || purchasedItems.contains(candidate)) {
                    continue;
                }
                double similarity = cosine(seedUsers, entry.getValue());
                if (similarity > 0) {
                    scores.merge(candidate, similarity, Double::sum);
                }
            }
        }
        return scores;
    }

    /** 单个种子商品与所有其它商品的 item-item 余弦相似度。 */
    private Map<Long, Double> itemSimilarityTo(Long seedItemId, Map<Long, Set<Long>> usersByItem) {
        Map<Long, Double> similarities = new HashMap<>();
        Set<Long> seedUsers = usersByItem.get(seedItemId);
        if (seedUsers == null || seedUsers.isEmpty()) {
            return similarities;
        }
        for (Map.Entry<Long, Set<Long>> entry : usersByItem.entrySet()) {
            if (Objects.equals(entry.getKey(), seedItemId)) {
                continue;
            }
            double similarity = cosine(seedUsers, entry.getValue());
            if (similarity > 0) {
                similarities.put(entry.getKey(), similarity);
            }
        }
        return similarities;
    }

    /** 两个用户集合的余弦相似度：|A∩B| / sqrt(|A|·|B|)。 */
    private double cosine(Set<Long> a, Set<Long> b) {
        if (a == null || b == null || a.isEmpty() || b.isEmpty()) {
            return 0.0;
        }
        Set<Long> smaller = a.size() <= b.size() ? a : b;
        Set<Long> larger = smaller == a ? b : a;
        long intersection = smaller.stream().filter(larger::contains).count();
        if (intersection == 0) {
            return 0.0;
        }
        return intersection / Math.sqrt((double) a.size() * b.size());
    }

    private double hybridScore(
            Product product,
            Set<String> preferredCategories,
            Map<Long, Double> popularityScores,
            Map<Long, Double> cfScores
    ) {
        // 协同过滤是主信号，热度与个人偏好作为补充与冷启动兜底。
        double score = cfScores.getOrDefault(product.getId(), 0.0) * 300.0;
        score += popularityScores.getOrDefault(product.getId(), 0.0);
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
            Map<Long, Long> viewerBought,
            Map<Long, Double> itemSimilarity,
            Map<Long, Double> popularityScores
    ) {
        double score = popularityScores.getOrDefault(product.getId(), 0.0);
        score += viewerBought.getOrDefault(product.getId(), 0L) * 120.0;
        score += itemSimilarity.getOrDefault(product.getId(), 0.0) * 200.0;
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

    private String reasonForUser(Product product, Set<String> preferredCategories, Map<Long, Double> cfScores, double maxCf) {
        double cf = cfScores.getOrDefault(product.getId(), 0.0);
        if (maxCf > 0 && cf >= maxCf * 0.6) {
            return "协同过滤：和你兴趣相近的用户也买了";
        }
        if (cf > 0) {
            return "协同过滤：与你购买/浏览过的商品相似";
        }
        if (product.getCategory() != null && preferredCategories.contains(product.getCategory())) {
            return "你近期偏好“" + product.getCategory() + "”";
        }
        return "结合全站热度为你推荐";
    }

    private String reasonForRelated(Product seed, Product product, Map<Long, Long> viewerBought, Map<Long, Double> itemSimilarity) {
        if (viewerBought.getOrDefault(product.getId(), 0L) > 0) {
            return "浏览过此商品的人也买了";
        }
        if (itemSimilarity.getOrDefault(product.getId(), 0.0) > 0) {
            return "协同过滤：常被一起购买";
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
