package com.example.shop_backend.service;

import com.example.shop_backend.model.Order;
import com.example.shop_backend.model.OrderItem;
import com.example.shop_backend.model.Product;
import com.example.shop_backend.model.PurchaseLog;
import com.example.shop_backend.model.User;
import com.example.shop_backend.repository.OrderItemRepository;
import com.example.shop_backend.repository.ProductRepository;
import com.example.shop_backend.repository.PurchaseLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class CsvExportService {

    private static final String UTF8_BOM = "\uFEFF";
    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Autowired
    private AccessControlService accessControlService;

    @Autowired
    private PurchaseLogRepository purchaseLogRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    public String adminSalesReport(Long adminId) {
        accessControlService.requireAdmin(adminId);
        Map<Long, Product> productsById = productRepository.findAll().stream()
                .filter(product -> product.getId() != null)
                .collect(Collectors.toMap(Product::getId, product -> product));

        StringBuilder csv = newCsv("订单ID", "购买时间", "顾客", "销售人员", "商品", "类别", "单价", "数量", "金额");
        purchaseLogRepository.findAll().stream()
                .sorted(Comparator.comparing(PurchaseLog::getPurchasedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .forEach(log -> {
                    Product product = productsById.get(log.getProductId());
                    String sellerName = product != null && product.getSeller() != null ? product.getSeller().getUsername() : "";
                    appendRow(
                            csv,
                            log.getOrderId(),
                            format(log.getPurchasedAt()),
                            log.getUsername(),
                            sellerName,
                            log.getProductName(),
                            log.getProductCategory(),
                            money(log.getUnitPrice()),
                            log.getQuantity(),
                            money(lineAmount(log.getUnitPrice(), log.getQuantity()))
                    );
                });
        return csv.toString();
    }

    public String sellerProductsReport(Long sellerId) {
        User seller = accessControlService.requireSeller(sellerId);
        StringBuilder csv = newCsv("商品ID", "商品名称", "类别", "价格", "库存", "销售人员");
        productRepository.findBySeller(seller).stream()
                .sorted(Comparator.comparing(Product::getId))
                .forEach(product -> appendRow(
                        csv,
                        product.getId(),
                        product.getName(),
                        product.getCategory(),
                        money(product.getPrice()),
                        product.getStockQuantity(),
                        seller.getUsername()
                ));
        return csv.toString();
    }

    public String sellerOrdersReport(Long sellerId) {
        User seller = accessControlService.requireSeller(sellerId);
        StringBuilder csv = newCsv("订单ID", "订单状态", "下单时间", "支付时间", "买家", "商品ID", "商品名称", "单价", "数量", "金额");
        orderItemRepository.findBySellerOrderByOrderCreatedAtDesc(seller).stream()
                .forEach(item -> {
                    Order order = item.getOrder();
                    appendRow(
                            csv,
                            order.getId(),
                            order.getStatus() == null ? "" : order.getStatus().name(),
                            format(order.getCreatedAt()),
                            format(order.getPaidAt()),
                            order.getUser() == null ? "" : order.getUser().getUsername(),
                            item.getProduct() == null ? "" : item.getProduct().getId(),
                            item.getProduct() == null ? "" : item.getProduct().getName(),
                            money(item.getPrice()),
                            item.getQuantity(),
                            money(lineAmount(item.getPrice(), item.getQuantity()))
                    );
                });
        return csv.toString();
    }

    private StringBuilder newCsv(String... headers) {
        StringBuilder csv = new StringBuilder(UTF8_BOM);
        appendRow(csv, (Object[]) headers);
        return csv;
    }

    private void appendRow(StringBuilder csv, Object... cells) {
        for (int i = 0; i < cells.length; i++) {
            if (i > 0) {
                csv.append(',');
            }
            csv.append(escape(cells[i]));
        }
        csv.append('\n');
    }

    private String escape(Object value) {
        String text = Objects.toString(value, "");
        if (text.contains("\"") || text.contains(",") || text.contains("\n") || text.contains("\r")) {
            return "\"" + text.replace("\"", "\"\"") + "\"";
        }
        return text;
    }

    private String format(LocalDateTime value) {
        return value == null ? "" : value.format(DATE_TIME);
    }

    private String money(Double value) {
        return String.format("%.2f", value == null ? 0.0 : value);
    }

    private double lineAmount(Double unitPrice, Integer quantity) {
        return (unitPrice == null ? 0.0 : unitPrice) * (quantity == null ? 0 : quantity);
    }
}
