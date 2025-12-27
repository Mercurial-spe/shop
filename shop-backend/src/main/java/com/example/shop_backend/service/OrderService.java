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

    public List<Order> getOrdersByUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("用户不存在"));
        return orderRepository.findByUser(user);
    }

    public List<OrderItem> getOrdersBySeller(Long sellerId) {
        User seller = userRepository.findById(sellerId).orElseThrow(() -> new RuntimeException("卖家不存在"));
        return orderItemRepository.findBySeller(seller);
    }

    @Transactional
    public Order checkout(Long userId, List<CartItem> items) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("用户不存在"));

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.SHIPPED);
        order.setCreatedAt(LocalDateTime.now());
        order.setShippedAt(LocalDateTime.now());

        for (CartItem item : items) {
            Product product = item.getProduct();
            Integer stock = product.getStockQuantity();
            if (stock != null) {
                int remaining = stock - item.getQuantity();
                if (remaining < 0) {
                    throw new RuntimeException("库存不足");
                }
                product.setStockQuantity(remaining);
                productRepository.save(product);
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setSeller(product.getSeller());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(product.getPrice());
            order.getItems().add(orderItem);
        }

        Order saved = orderRepository.save(order);
        emailService.sendOrderConfirmation(saved);
        return saved;
    }

    @Transactional
    public Order purchaseSingle(Long userId, Long productId, int quantity) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("用户不存在"));
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("商品不存在"));

        Integer stock = product.getStockQuantity();
        if (stock != null) {
            int remaining = stock - quantity;
            if (remaining < 0) {
                throw new RuntimeException("库存不足");
            }
            product.setStockQuantity(remaining);
            productRepository.save(product);
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.SHIPPED);
        order.setCreatedAt(LocalDateTime.now());
        order.setShippedAt(LocalDateTime.now());

        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(order);
        orderItem.setProduct(product);
        orderItem.setSeller(product.getSeller());
        orderItem.setQuantity(quantity);
        orderItem.setPrice(product.getPrice());
        order.getItems().add(orderItem);

        Order saved = orderRepository.save(order);
        emailService.sendOrderConfirmation(saved);
        return saved;
    }

    public Map<String, Object> getSellerStats(Long sellerId) {
        User seller = userRepository.findById(sellerId).orElseThrow(() -> new RuntimeException("卖家不存在"));
        List<OrderItem> items = orderItemRepository.findBySeller(seller);

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
}
