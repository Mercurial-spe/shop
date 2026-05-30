package com.example.shop_backend.service;

import com.example.shop_backend.model.*;
import com.example.shop_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class DemoDataService {

    @Autowired
    private AccessControlService accessControlService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductCategoryRepository categoryRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private LoginLogRepository loginLogRepository;

    @Autowired
    private BrowseLogRepository browseLogRepository;

    @Autowired
    private PurchaseLogRepository purchaseLogRepository;

    @Autowired
    private OperationLogRepository operationLogRepository;

    @Transactional
    public Map<String, Object> resetDemoData(Long adminId) {
        User admin = accessControlService.requireAdmin(adminId);
        User seller01 = requireUser("seller01");
        User seller02 = requireUser("seller02");
        User customer01 = requireUser("customer01");
        User customer02 = requireUser("customer02");

        clearBusinessData();

        Map<String, ProductCategory> categories = createCategories(seller01);
        List<Product> products = createProducts(seller01, seller02);
        List<User> actors = List.of(admin, seller01, seller02, customer01, customer02);
        List<User> customers = List.of(customer01, customer02);

        generateLoginLogs(actors);
        generateBrowseLogs(customers, products);
        generateOrdersAndPurchaseLogs(customers, products);
        generateRecentStatusOrders(customers, products);
        generateOperationLogs(admin, seller01, seller02);

        OperationLog resetLog = new OperationLog();
        resetLog.setActorId(admin.getId());
        resetLog.setUsername(admin.getUsername());
        resetLog.setRole(admin.getRole());
        resetLog.setAction("DEMO_DATA_RESET");
        resetLog.setContent("重置并生成课程演示数据");
        resetLog.setIpAddress("127.0.0.1");
        resetLog.setCreatedAt(LocalDateTime.now());
        operationLogRepository.save(resetLog);

        return Map.of(
                "categories", categories.size(),
                "products", productRepository.count(),
                "orders", orderRepository.count(),
                "loginLogs", loginLogRepository.count(),
                "browseLogs", browseLogRepository.count(),
                "purchaseLogs", purchaseLogRepository.count(),
                "operationLogs", operationLogRepository.count()
        );
    }

    private void clearBusinessData() {
        cartItemRepository.deleteAllInBatch();
        orderItemRepository.deleteAllInBatch();
        orderRepository.deleteAllInBatch();
        productRepository.deleteAllInBatch();
        categoryRepository.deleteAllInBatch();
        loginLogRepository.deleteAllInBatch();
        browseLogRepository.deleteAllInBatch();
        purchaseLogRepository.deleteAllInBatch();
        operationLogRepository.deleteAllInBatch();
    }

    private Map<String, ProductCategory> createCategories(User creator) {
        Map<String, ProductCategory> categories = new LinkedHashMap<>();
        for (String name : List.of("手机数码", "电脑办公", "智能配件", "智能穿戴")) {
            ProductCategory category = new ProductCategory();
            category.setName(name);
            category.setCreatedById(creator.getId());
            category.setCreatedByUsername(creator.getUsername());
            category.setCreatedAt(LocalDateTime.now().minusDays(30));
            categories.put(name, categoryRepository.save(category));
        }
        return categories;
    }

    private List<Product> createProducts(User seller01, User seller02) {
        return List.of(
                createProduct(seller01, "Aurora Phone Pro", "高性能影像旗舰手机，近三天销量突增。", 6999.00, 52, "手机数码"),
                createProduct(seller01, "Nebula Laptop Air", "轻薄办公笔记本，高客单价商品。", 8299.00, 24, "电脑办公"),
                createProduct(seller01, "Pulse Wireless Earbuds", "主动降噪无线耳机，推荐系统高频样本。", 1299.00, 76, "智能配件"),
                createProduct(seller01, "Studio 4K Monitor", "设计与办公两用显示器。", 2399.00, 16, "电脑办公"),
                createProduct(seller02, "Orbit Smart Watch", "健康监测智能手表。", 1899.00, 33, "智能穿戴"),
                createProduct(seller02, "Metro Mechanical Keyboard", "办公与游戏两用机械键盘。", 499.00, 18, "电脑办公"),
                createProduct(seller02, "Pocket Power Bank", "轻薄快充移动电源，低库存预警样本。", 159.00, 3, "智能配件"),
                createProduct(seller02, "USB-C Travel Hub", "便携扩展坞，高浏览低购买样本。", 299.00, 12, "智能配件")
        );
    }

    private Product createProduct(User seller, String name, String description, Double price, Integer stock, String category) {
        Product product = new Product();
        product.setSeller(seller);
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setStockQuantity(stock);
        product.setCategory(category);
        product.setImageUrl("/100191209_p0.jpg");
        return productRepository.save(product);
    }

    private void generateLoginLogs(List<User> users) {
        LocalDateTime now = LocalDateTime.now();
        for (int day = 29; day >= 0; day--) {
            for (User user : users) {
                if (user.getRole() == UserRole.ADMIN && day % 3 != 0) {
                    continue;
                }
                LoginLog log = new LoginLog();
                log.setUserId(user.getId());
                log.setUsername(user.getUsername());
                log.setRole(user.getRole());
                log.setIpAddress(ipFor(user, day));
                log.setCreatedAt(now.minusDays(day).withHour(9 + Math.floorMod(day + user.getId().intValue(), 10)).withMinute(12));
                loginLogRepository.save(log);
            }
        }
    }

    private void generateBrowseLogs(List<User> customers, List<Product> products) {
        LocalDateTime now = LocalDateTime.now();
        Random random = new Random(20260520L);
        for (int day = 29; day >= 0; day--) {
            for (int i = 0; i < 7; i++) {
                User user = customers.get(Math.floorMod(day + i, customers.size()));
                Product product = pickBrowseProduct(products, day, i);
                BrowseLog log = new BrowseLog();
                log.setUserId(user.getId());
                log.setUsername(user.getUsername());
                log.setProductId(product.getId());
                log.setProductName(product.getName());
                log.setProductCategory(product.getCategory());
                log.setDurationSeconds(12 + random.nextInt(170));
                log.setIpAddress(ipFor(user, day));
                log.setCreatedAt(now.minusDays(day).withHour(10 + (i % 8)).withMinute((i * 7) % 60));
                browseLogRepository.save(log);
            }
        }
        generateSuspiciousBrowseBurst(customers.get(1), products.get(7), now);
    }

    private void generateSuspiciousBrowseBurst(User customer, Product product, LocalDateTime now) {
        for (int i = 0; i < 28; i++) {
            BrowseLog log = new BrowseLog();
            log.setUserId(customer.getId());
            log.setUsername(customer.getUsername());
            log.setProductId(product.getId());
            log.setProductName(product.getName());
            log.setProductCategory(product.getCategory());
            log.setDurationSeconds(3 + (i % 9));
            log.setIpAddress("10.0.99.250");
            log.setCreatedAt(now.minusHours(1).plusMinutes(i));
            browseLogRepository.save(log);
        }
    }

    private Product pickBrowseProduct(List<Product> products, int day, int index) {
        if (day <= 2 && index <= 2) {
            return products.get(0);
        }
        if (index == 5 || index == 6) {
            return products.get(7);
        }
        return products.get(Math.floorMod(day + index, products.size()));
    }

    private void generateOrdersAndPurchaseLogs(List<User> customers, List<Product> products) {
        LocalDateTime now = LocalDateTime.now();
        Random random = new Random(20260521L);
        for (int day = 29; day >= 0; day--) {
            int ordersToday = day <= 2 ? 5 : 2 + (day % 3 == 0 ? 1 : 0);
            for (int i = 0; i < ordersToday; i++) {
                User customer = customers.get(Math.floorMod(day + i, customers.size()));
                Product product = pickPurchaseProduct(products, day, i);
                int quantity = product.getName().contains("Aurora") && day <= 2 ? 2 : 1 + random.nextInt(2);
                createOrder(customer, product, quantity, now.minusDays(day).withHour(13 + (i % 7)).withMinute((i * 11) % 60));
            }
        }
    }

    private Product pickPurchaseProduct(List<Product> products, int day, int index) {
        if (day <= 2 && index <= 2) {
            return products.get(0);
        }
        int selected = Math.floorMod(day * 3 + index, products.size() - 1);
        return products.get(selected);
    }

    private void createOrder(User customer, Product product, int quantity, LocalDateTime createdAt) {
        Order order = new Order();
        order.setUser(customer);
        order.setCreatedAt(createdAt);
        order.setShippedAt(createdAt.plusHours(2));
        order.setStatus(createdAt.isBefore(LocalDateTime.now().minusDays(2)) ? OrderStatus.RECEIVED : OrderStatus.SHIPPED);
        if (order.getStatus() == OrderStatus.RECEIVED) {
            order.setReceivedAt(createdAt.plusDays(1));
        }

        int remaining = Math.max(0, (product.getStockQuantity() == null ? 0 : product.getStockQuantity()) - quantity);
        product.setStockQuantity(remaining);
        productRepository.save(product);

        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setProduct(product);
        item.setSeller(product.getSeller());
        item.setQuantity(quantity);
        item.setPrice(product.getPrice());
        order.getItems().add(item);

        Order saved = orderRepository.save(order);
        PurchaseLog log = new PurchaseLog();
        log.setUserId(customer.getId());
        log.setUsername(customer.getUsername());
        log.setOrderId(saved.getId());
        log.setProductId(product.getId());
        log.setProductName(product.getName());
        log.setProductCategory(product.getCategory());
        log.setUnitPrice(product.getPrice());
        log.setQuantity(quantity);
        log.setPurchasedAt(createdAt);
        purchaseLogRepository.save(log);
    }

    /**
     * 补充「待支付 / 已支付」状态的近期订单，让管理台的订单状态分布四种都有数据。
     * 待支付：仅建单、不减库存、不写购买日志（与结算流程一致）。
     * 已支付：减库存并写购买日志（与支付流程一致）。
     */
    private void generateRecentStatusOrders(List<User> customers, List<Product> products) {
        LocalDateTime now = LocalDateTime.now();
        // 待支付订单（2 笔）
        createStatusOrder(customers.get(0), products.get(2), 1, now.minusHours(5), OrderStatus.PENDING_PAYMENT);
        createStatusOrder(customers.get(1), products.get(4), 1, now.minusHours(2), OrderStatus.PENDING_PAYMENT);
        // 已支付（待发货）订单（2 笔）
        createStatusOrder(customers.get(0), products.get(1), 1, now.minusHours(8), OrderStatus.PAID);
        createStatusOrder(customers.get(1), products.get(3), 2, now.minusHours(3), OrderStatus.PAID);
    }

    private void createStatusOrder(User customer, Product product, int quantity, LocalDateTime createdAt, OrderStatus status) {
        Order order = new Order();
        order.setUser(customer);
        order.setCreatedAt(createdAt);
        order.setStatus(status);

        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setProduct(product);
        item.setSeller(product.getSeller());
        item.setQuantity(quantity);
        item.setPrice(product.getPrice());
        order.getItems().add(item);

        if (status == OrderStatus.PAID) {
            order.setPaidAt(createdAt.plusMinutes(5));
            order.setPaymentMethod("Mercurial 模拟支付");
            int remaining = Math.max(0, (product.getStockQuantity() == null ? 0 : product.getStockQuantity()) - quantity);
            product.setStockQuantity(remaining);
            productRepository.save(product);
        }

        Order saved = orderRepository.save(order);

        if (status == OrderStatus.PAID) {
            PurchaseLog log = new PurchaseLog();
            log.setUserId(customer.getId());
            log.setUsername(customer.getUsername());
            log.setOrderId(saved.getId());
            log.setProductId(product.getId());
            log.setProductName(product.getName());
            log.setProductCategory(product.getCategory());
            log.setUnitPrice(product.getPrice());
            log.setQuantity(quantity);
            log.setPurchasedAt(createdAt.plusMinutes(5));
            purchaseLogRepository.save(log);
        }
    }

    private void generateOperationLogs(User admin, User seller01, User seller02) {
        LocalDateTime now = LocalDateTime.now();
        saveOperation(admin, "SELLER_PASSWORD_RESET", "重置销售人员密码：seller02", now.minusDays(21), "127.0.0.1");
        saveOperation(seller01, "PRODUCT_UPDATE", "调整商品库存：Aurora Phone Pro", now.minusDays(12), "127.0.0.1");
        saveOperation(seller02, "PRODUCT_UPDATE", "调整商品价格：Pocket Power Bank", now.minusDays(8), "127.0.0.1");
        saveOperation(seller01, "CATEGORY_CREATE", "添加商品类别：智能穿戴", now.minusDays(6), "127.0.0.1");
        saveOperation(admin, "SELLER_CREATE", "添加销售人员：seller02", now.minusDays(4), "127.0.0.1");
    }

    private void saveOperation(User actor, String action, String content, LocalDateTime createdAt, String ipAddress) {
        OperationLog log = new OperationLog();
        log.setActorId(actor.getId());
        log.setUsername(actor.getUsername());
        log.setRole(actor.getRole());
        log.setAction(action);
        log.setContent(content);
        log.setIpAddress(ipAddress);
        log.setCreatedAt(createdAt);
        operationLogRepository.save(log);
    }

    private User requireUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("缺少演示账号：" + username));
    }

    private String ipFor(User user, int day) {
        // 用有代表性的国内公网前两段前缀（与 IpRegionResolver 的归属表对应），
        // 让画像能解析出真实且多样的地域；按用户稳定分配前缀，按天/用户变化主机段。
        String[] prefixes = {
                "219.135", // 华南·广东
                "123.125", // 华北·北京
                "101.226", // 华东·上海
                "125.69",  // 西南·四川
                "117.136"  // 华中·湖北
        };
        int idx = Math.floorMod(user.getId().intValue(), prefixes.length);
        int third = Math.floorMod(day, 8);
        int tail = 20 + Math.floorMod(user.getId().intValue() * 13 + day, 180);
        return prefixes[idx] + "." + third + "." + tail;
    }
}
