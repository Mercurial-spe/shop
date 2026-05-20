package com.example.shop_backend.service;

import com.example.shop_backend.model.BrowseLog;
import com.example.shop_backend.model.Product;
import com.example.shop_backend.model.PurchaseLog;
import com.example.shop_backend.model.User;
import com.example.shop_backend.model.UserRole;
import com.example.shop_backend.repository.BrowseLogRepository;
import com.example.shop_backend.repository.ProductRepository;
import com.example.shop_backend.repository.PurchaseLogRepository;
import com.example.shop_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private AccessControlService accessControlService;

    @Autowired
    private PurchaseLogRepository purchaseLogRepository;

    @Autowired
    private BrowseLogRepository browseLogRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> overview(Long adminId) {
        accessControlService.requireAdmin(adminId);
        List<PurchaseLog> purchases = purchaseLogRepository.findAll();
        List<BrowseLog> browses = browseLogRepository.findAll();
        List<Product> products = productRepository.findAll();
        List<User> users = userRepository.findAll();

        double totalRevenue = purchases.stream().mapToDouble(this::lineAmount).sum();
        int totalUnits = purchases.stream().mapToInt(log -> valueOrZero(log.getQuantity())).sum();
        long totalOrders = purchases.stream().map(PurchaseLog::getOrderId).filter(Objects::nonNull).distinct().count();
        long activeCustomers = purchases.stream().map(PurchaseLog::getUserId).filter(Objects::nonNull).distinct().count();
        long customerCount = users.stream().filter(user -> user.getRole() == UserRole.CUSTOMER).count();
        double conversionRate = browses.isEmpty() ? 0.0 : (double) purchases.size() / browses.size();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalRevenue", round2(totalRevenue));
        result.put("totalOrders", totalOrders);
        result.put("totalUnits", totalUnits);
        result.put("totalProducts", products.size());
        result.put("activeCustomers", activeCustomers);
        result.put("customerCount", customerCount);
        result.put("browseCount", browses.size());
        result.put("purchaseCount", purchases.size());
        result.put("conversionRate", round4(conversionRate));
        result.put("averageOrderValue", round2(totalOrders == 0 ? 0.0 : totalRevenue / totalOrders));
        result.put("lowStockCount", products.stream().filter(this::isLowStock).count());
        result.put("forecast", forecast(purchases));
        return result;
    }

    public Map<String, Object> rankings(Long adminId) {
        accessControlService.requireAdmin(adminId);
        List<PurchaseLog> purchases = purchaseLogRepository.findAll();
        List<Product> products = productRepository.findAll();
        Map<Long, Product> productsById = products.stream()
                .filter(product -> product.getId() != null)
                .collect(Collectors.toMap(Product::getId, product -> product));

        Map<Long, Metric> productMetrics = new HashMap<>();
        Map<String, Metric> categoryMetrics = new HashMap<>();
        Map<Long, Metric> sellerMetrics = new HashMap<>();

        for (PurchaseLog log : purchases) {
            double amount = lineAmount(log);
            int quantity = valueOrZero(log.getQuantity());
            productMetrics.computeIfAbsent(log.getProductId(), key -> new Metric(log.getProductId(), safeText(log.getProductName(), "商品")))
                    .add(amount, quantity);
            categoryMetrics.computeIfAbsent(safeText(log.getProductCategory(), "未分类"), key -> new Metric(null, key))
                    .add(amount, quantity);

            Product product = productsById.get(log.getProductId());
            if (product != null && product.getSeller() != null) {
                User seller = product.getSeller();
                sellerMetrics.computeIfAbsent(seller.getId(), key -> new Metric(seller.getId(), seller.getUsername()))
                        .add(amount, quantity);
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("products", topMetrics(productMetrics.values(), 10));
        result.put("categories", topMetrics(categoryMetrics.values(), 10));
        result.put("sellers", topMetrics(sellerMetrics.values(), 10));
        return result;
    }

    public Map<String, Object> trends(Long adminId, String period) {
        accessControlService.requireAdmin(adminId);
        List<PurchaseLog> purchases = purchaseLogRepository.findAll();
        String normalizedPeriod = normalizePeriod(period);

        Map<String, Metric> buckets = new HashMap<>();
        for (PurchaseLog log : purchases) {
            if (log.getPurchasedAt() == null) {
                continue;
            }
            String key = periodKey(log.getPurchasedAt().toLocalDate(), normalizedPeriod);
            buckets.computeIfAbsent(key, unused -> new Metric(null, key))
                    .add(lineAmount(log), valueOrZero(log.getQuantity()));
        }

        List<Map<String, Object>> points = buckets.values().stream()
                .sorted(Comparator.comparing(metric -> metric.name))
                .map(metric -> {
                    Map<String, Object> point = metric.toMap();
                    point.put("period", metric.name);
                    return point;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("period", normalizedPeriod);
        result.put("points", points);
        result.put("forecast", forecast(purchases));
        return result;
    }

    public Map<String, Object> anomalies(Long adminId) {
        accessControlService.requireAdmin(adminId);
        List<Product> products = productRepository.findAll();
        List<PurchaseLog> purchases = purchaseLogRepository.findAll();
        List<BrowseLog> browses = browseLogRepository.findAll();
        LocalDate today = LocalDate.now();

        List<Map<String, Object>> lowStock = products.stream()
                .filter(this::isLowStock)
                .map(product -> productAlert("LOW_STOCK", "低库存", product, "库存低于 5 件，建议补货。"))
                .collect(Collectors.toList());

        List<Map<String, Object>> salesSpike = detectSalesSpike(purchases, today);
        List<Map<String, Object>> highBrowseLowPurchase = detectHighBrowseLowPurchase(products, browses, purchases);
        List<Map<String, Object>> suspiciousBrowse = detectSuspiciousBrowse(browses, today);

        List<Map<String, Object>> all = new ArrayList<>();
        all.addAll(lowStock);
        all.addAll(salesSpike);
        all.addAll(highBrowseLowPurchase);
        all.addAll(suspiciousBrowse);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", all.size());
        result.put("lowStock", lowStock);
        result.put("salesSpike", salesSpike);
        result.put("highBrowseLowPurchase", highBrowseLowPurchase);
        result.put("suspiciousBrowse", suspiciousBrowse);
        result.put("all", all);
        return result;
    }

    public List<Map<String, Object>> customerProfiles(Long adminId) {
        accessControlService.requireAdmin(adminId);
        List<User> customers = userRepository.findByRoleOrderByUsernameAsc(UserRole.CUSTOMER);
        List<PurchaseLog> purchases = purchaseLogRepository.findAll();
        List<BrowseLog> browses = browseLogRepository.findAll();

        return customers.stream()
                .map(customer -> customerProfile(customer, purchases, browses))
                .collect(Collectors.toList());
    }

    private Map<String, Object> customerProfile(User customer, List<PurchaseLog> purchases, List<BrowseLog> browses) {
        List<PurchaseLog> userPurchases = purchases.stream()
                .filter(log -> Objects.equals(log.getUserId(), customer.getId()))
                .collect(Collectors.toList());
        List<BrowseLog> userBrowses = browses.stream()
                .filter(log -> Objects.equals(log.getUserId(), customer.getId()))
                .collect(Collectors.toList());

        double spend = userPurchases.stream().mapToDouble(this::lineAmount).sum();
        String favoriteCategory = favoriteCategory(userPurchases, userBrowses);
        String region = userBrowses.stream()
                .map(BrowseLog::getIpAddress)
                .filter(Objects::nonNull)
                .findFirst()
                .map(this::mockRegion)
                .orElse("未知地区");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("userId", customer.getId());
        result.put("username", customer.getUsername());
        result.put("region", region);
        result.put("purchasePower", purchasePower(spend));
        result.put("favoriteCategory", favoriteCategory);
        result.put("totalSpend", round2(spend));
        result.put("orderCount", userPurchases.stream().map(PurchaseLog::getOrderId).filter(Objects::nonNull).distinct().count());
        result.put("browseCount", userBrowses.size());
        result.put("averageStaySeconds", round2(userBrowses.stream().mapToInt(log -> valueOrZero(log.getDurationSeconds())).average().orElse(0.0)));
        return result;
    }

    private Map<String, Object> forecast(List<PurchaseLog> purchases) {
        LocalDate today = LocalDate.now();
        double last7 = revenueBetween(purchases, today.minusDays(6), today);
        double previous7 = revenueBetween(purchases, today.minusDays(13), today.minusDays(7));
        double predictedNext7 = previous7 == 0 ? last7 : last7 + (last7 - previous7) * 0.5;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("last7DaysRevenue", round2(last7));
        result.put("previous7DaysRevenue", round2(previous7));
        result.put("growthRate", round4(previous7 == 0 ? 0.0 : (last7 - previous7) / previous7));
        result.put("predictedNext7DaysRevenue", round2(Math.max(0.0, predictedNext7)));
        result.put("method", "最近 7 天与前 7 天差值的简单外推");
        return result;
    }

    private List<Map<String, Object>> detectSalesSpike(List<PurchaseLog> purchases, LocalDate today) {
        Map<Long, List<PurchaseLog>> byProduct = purchases.stream()
                .filter(log -> log.getProductId() != null && log.getPurchasedAt() != null)
                .collect(Collectors.groupingBy(PurchaseLog::getProductId));

        List<Map<String, Object>> alerts = new ArrayList<>();
        for (Map.Entry<Long, List<PurchaseLog>> entry : byProduct.entrySet()) {
            List<PurchaseLog> logs = entry.getValue();
            int recentUnits = logs.stream()
                    .filter(log -> !log.getPurchasedAt().toLocalDate().isBefore(today.minusDays(2)))
                    .mapToInt(log -> valueOrZero(log.getQuantity()))
                    .sum();
            int previousUnits = logs.stream()
                    .filter(log -> {
                        LocalDate date = log.getPurchasedAt().toLocalDate();
                        return !date.isBefore(today.minusDays(9)) && date.isBefore(today.minusDays(2));
                    })
                    .mapToInt(log -> valueOrZero(log.getQuantity()))
                    .sum();
            double previousDailyAvg = previousUnits / 7.0;
            if (recentUnits >= 6 && (previousDailyAvg == 0.0 || recentUnits / 3.0 >= previousDailyAvg * 2.0)) {
                PurchaseLog sample = logs.get(0);
                alerts.add(simpleAlert(
                        "SALES_SPIKE",
                        "销量突增",
                        sample.getProductId(),
                        safeText(sample.getProductName(), "商品"),
                        "近 3 天销量显著高于前 7 天均值。"
                ));
            }
        }
        return alerts;
    }

    private List<Map<String, Object>> detectHighBrowseLowPurchase(List<Product> products, List<BrowseLog> browses, List<PurchaseLog> purchases) {
        Map<Long, Long> browseCounts = browses.stream()
                .filter(log -> log.getProductId() != null)
                .collect(Collectors.groupingBy(BrowseLog::getProductId, Collectors.counting()));
        Map<Long, Integer> purchaseUnits = purchases.stream()
                .filter(log -> log.getProductId() != null)
                .collect(Collectors.groupingBy(PurchaseLog::getProductId, Collectors.summingInt(log -> valueOrZero(log.getQuantity()))));

        return products.stream()
                .filter(product -> browseCounts.getOrDefault(product.getId(), 0L) >= 10)
                .filter(product -> purchaseUnits.getOrDefault(product.getId(), 0) <= 2)
                .map(product -> productAlert("LOW_CONVERSION", "高浏览低购买", product, "浏览量较高但购买量偏低，建议检查价格、详情页或库存。"))
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> detectSuspiciousBrowse(List<BrowseLog> browses, LocalDate today) {
        Map<String, Long> byIp = browses.stream()
                .filter(log -> log.getIpAddress() != null && log.getCreatedAt() != null)
                .filter(log -> !log.getCreatedAt().toLocalDate().isBefore(today.minusDays(1)))
                .collect(Collectors.groupingBy(BrowseLog::getIpAddress, Collectors.counting()));

        return byIp.entrySet().stream()
                .filter(entry -> entry.getValue() >= 20)
                .map(entry -> {
                    Map<String, Object> alert = new LinkedHashMap<>();
                    alert.put("type", "SUSPICIOUS_BROWSE");
                    alert.put("title", "疑似爬虫/高频浏览");
                    alert.put("ipAddress", entry.getKey());
                    alert.put("browseCount", entry.getValue());
                    alert.put("message", "同一 IP 在近 48 小时内浏览次数过高。");
                    return alert;
                })
                .collect(Collectors.toList());
    }

    private Map<String, Object> productAlert(String type, String title, Product product, String message) {
        return simpleAlert(type, title, product.getId(), product.getName(), message);
    }

    private Map<String, Object> simpleAlert(String type, String title, Long productId, String productName, String message) {
        Map<String, Object> alert = new LinkedHashMap<>();
        alert.put("type", type);
        alert.put("title", title);
        alert.put("productId", productId);
        alert.put("productName", productName);
        alert.put("message", message);
        return alert;
    }

    private List<Map<String, Object>> topMetrics(Iterable<Metric> metrics, int limit) {
        List<Metric> metricList = new ArrayList<>();
        metrics.forEach(metricList::add);
        return metricList.stream()
                .sorted(Comparator.comparingDouble((Metric metric) -> metric.revenue).reversed())
                .limit(limit)
                .map(Metric::toMap)
                .collect(Collectors.toList());
    }

    private double revenueBetween(List<PurchaseLog> purchases, LocalDate start, LocalDate end) {
        return purchases.stream()
                .filter(log -> log.getPurchasedAt() != null)
                .filter(log -> {
                    LocalDate date = log.getPurchasedAt().toLocalDate();
                    return !date.isBefore(start) && !date.isAfter(end);
                })
                .mapToDouble(this::lineAmount)
                .sum();
    }

    private String favoriteCategory(List<PurchaseLog> purchases, List<BrowseLog> browses) {
        Map<String, Long> purchaseCategories = purchases.stream()
                .map(PurchaseLog::getProductCategory)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(category -> category, Collectors.counting()));
        if (!purchaseCategories.isEmpty()) {
            return topEntry(purchaseCategories);
        }

        Map<String, Long> browseCategories = browses.stream()
                .map(BrowseLog::getProductCategory)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(category -> category, Collectors.counting()));
        return browseCategories.isEmpty() ? "未形成偏好" : topEntry(browseCategories);
    }

    private String topEntry(Map<String, Long> values) {
        return values.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("未形成偏好");
    }

    private String periodKey(LocalDate date, String period) {
        if ("month".equals(period)) {
            return date.getYear() + "-" + String.format("%02d", date.getMonthValue());
        }
        if ("week".equals(period)) {
            int week = date.get(WeekFields.of(Locale.CHINA).weekOfWeekBasedYear());
            return date.getYear() + "-W" + String.format("%02d", week);
        }
        return date.toString();
    }

    private String normalizePeriod(String period) {
        Set<String> allowed = Set.of("day", "week", "month");
        return allowed.contains(period) ? period : "day";
    }

    private boolean isLowStock(Product product) {
        return product.getStockQuantity() != null && product.getStockQuantity() <= 5;
    }

    private String purchasePower(double spend) {
        if (spend >= 30000) {
            return "高购买力";
        }
        if (spend >= 8000) {
            return "中购买力";
        }
        return "低购买力";
    }

    private String mockRegion(String ipAddress) {
        int bucket = 0;
        String[] parts = ipAddress.split("\\.");
        if (parts.length >= 3) {
            try {
                bucket = Integer.parseInt(parts[2]);
            } catch (NumberFormatException ignored) {
                bucket = 0;
            }
        }
        return switch (Math.floorMod(bucket, 5)) {
            case 0 -> "华东";
            case 1 -> "华南";
            case 2 -> "华北";
            case 3 -> "西南";
            default -> "华中";
        };
    }

    private double lineAmount(PurchaseLog log) {
        return valueOrZero(log.getUnitPrice()) * valueOrZero(log.getQuantity());
    }

    private int valueOrZero(Integer value) {
        return value == null ? 0 : value;
    }

    private double valueOrZero(Double value) {
        return value == null ? 0.0 : value;
    }

    private String safeText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private double round4(double value) {
        return Math.round(value * 10000.0) / 10000.0;
    }

    private static class Metric {
        private final Long id;
        private final String name;
        private double revenue;
        private int units;

        private Metric(Long id, String name) {
            this.id = id;
            this.name = name;
        }

        private void add(double amount, int quantity) {
            revenue += amount;
            units += quantity;
        }

        private Map<String, Object> toMap() {
            Map<String, Object> result = new LinkedHashMap<>();
            if (id != null) {
                result.put("id", id);
            }
            result.put("name", name);
            result.put("revenue", Math.round(revenue * 100.0) / 100.0);
            result.put("units", units);
            return result;
        }
    }
}
