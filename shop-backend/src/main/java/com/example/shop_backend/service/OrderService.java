package com.example.shop_backend.service;

import com.example.shop_backend.model.*;
import com.example.shop_backend.repository.OrderItemRepository;
import com.example.shop_backend.repository.OrderRepository;
import com.example.shop_backend.repository.ProductRepository;
import com.example.shop_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AccessControlService accessControlService;

    @Autowired
    private AuditLogService auditLogService;

    public List<Order> getOrdersByUser(Long userId) {
        User user = accessControlService.requireCustomer(userId);
        return orderRepository.findByUser(user);
    }

    public Order getOrderForUser(Long orderId, Long userId) {
        User user = accessControlService.requireCustomer(userId);
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("订单不存在"));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("无权查看该订单");
        }
        return order;
    }

    public List<OrderItem> getOrdersBySeller(Long sellerId) {
        User seller = accessControlService.requireSeller(sellerId);
        return orderItemRepository.findBySeller(seller);
    }

    @Transactional
    public Order checkout(Long userId, List<CartItem> items) {
        User user = accessControlService.requireCustomer(userId);

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        order.setCreatedAt(LocalDateTime.now());

        for (CartItem item : items) {
            Product product = item.getProduct();
            ensureEnoughStock(product, item.getQuantity());

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setSeller(product.getSeller());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(product.getPrice());
            order.getItems().add(orderItem);
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order purchaseSingle(Long userId, Long productId, int quantity) {
        User user = accessControlService.requireCustomer(userId);
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("商品不存在"));
        if (quantity <= 0) {
            throw new RuntimeException("商品数量必须大于 0");
        }

        ensureEnoughStock(product, quantity);

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        order.setCreatedAt(LocalDateTime.now());

        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(order);
        orderItem.setProduct(product);
        orderItem.setSeller(product.getSeller());
        orderItem.setQuantity(quantity);
        orderItem.setPrice(product.getPrice());
        order.getItems().add(orderItem);

        return orderRepository.save(order);
    }

    @Transactional
    public Order payOrder(Long orderId, Long userId, String paymentMethod) {
        User user = accessControlService.requireCustomer(userId);
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("订单不存在"));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("无权支付该订单");
        }
        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new RuntimeException("订单当前状态不能重复支付");
        }

        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("商品不存在"));
            reduceStock(product, item.getQuantity());
            productRepository.save(product);
            item.setProduct(product);
        }

        LocalDateTime paidAt = LocalDateTime.now();
        order.setStatus(OrderStatus.PAID);
        order.setPaidAt(paidAt);
        order.setPaymentMethod(normalizePaymentMethod(paymentMethod));
        order.setPaymentNo("SIM-" + order.getId() + "-" + paidAt.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));

        Order saved = orderRepository.save(order);
        saved.getItems().forEach(item -> auditLogService.logPurchase(user, saved, item));
        emailService.sendOrderConfirmation(saved);
        return saved;
    }

    public Map<String, Object> getSellerStats(Long sellerId) {
        User seller = accessControlService.requireSeller(sellerId);
        List<OrderItem> items = orderItemRepository.findBySeller(seller).stream()
                .filter(item -> item.getOrder().getStatus() != OrderStatus.PENDING_PAYMENT)
                .collect(Collectors.toList());

        double totalRevenue = items.stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();

        int totalOrders = (int) items.stream()
                .map(item -> item.getOrder().getId())
                .distinct()
                .count();

        int totalUnits = items.stream()
                .mapToInt(OrderItem::getQuantity)
                .sum();

        Map<String, Long> productSales = items.stream()
                .collect(Collectors.groupingBy(item -> item.getProduct().getName(), Collectors.summingLong(OrderItem::getQuantity)));

        return Map.of(
                "totalRevenue", totalRevenue,
                "totalOrders", totalOrders,
                "totalUnits", totalUnits,
                "productSales", productSales
        );
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void autoReceiveOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(10);
        List<Order> orders = orderRepository.findByStatusAndShippedAtBefore(OrderStatus.SHIPPED, cutoff);
        for (Order order : orders) {
            order.setStatus(OrderStatus.RECEIVED);
            order.setReceivedAt(LocalDateTime.now());
            orderRepository.save(order);
        }
    }

    private void ensureEnoughStock(Product product, int quantity) {
        Integer stock = product.getStockQuantity();
        if (stock != null && stock - quantity < 0) {
            throw new RuntimeException("库存不足");
        }
    }

    private void reduceStock(Product product, int quantity) {
        ensureEnoughStock(product, quantity);
        Integer stock = product.getStockQuantity();
        if (stock != null) {
            product.setStockQuantity(stock - quantity);
        }
    }

    private String normalizePaymentMethod(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            return "模拟支付";
        }
        return paymentMethod.trim();
    }
}
