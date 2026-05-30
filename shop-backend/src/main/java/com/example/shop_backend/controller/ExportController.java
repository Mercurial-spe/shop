package com.example.shop_backend.controller;

import com.example.shop_backend.service.CsvExportService;
import com.example.shop_backend.service.CsvImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    @Autowired
    private CsvExportService csvExportService;

    @Autowired
    private CsvImportService csvImportService;

    @GetMapping("/admin/sales")
    public ResponseEntity<?> adminSalesReport(@RequestParam Long adminId) {
        try {
            return csv("admin-sales-report.csv", csvExportService.adminSalesReport(adminId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/seller/products")
    public ResponseEntity<?> sellerProductsReport(@RequestParam Long sellerId) {
        try {
            return csv("seller-products-report.csv", csvExportService.sellerProductsReport(sellerId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/seller/orders")
    public ResponseEntity<?> sellerOrdersReport(@RequestParam Long sellerId) {
        try {
            return csv("seller-orders-report.csv", csvExportService.sellerOrdersReport(sellerId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/seller/products/import")
    public ResponseEntity<?> importSellerProducts(@RequestParam Long sellerId, @RequestBody String csvContent) {
        try {
            return ResponseEntity.ok(csvImportService.importProducts(sellerId, csvContent));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private ResponseEntity<String> csv(String filename, String body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(new MediaType("text", "csv", StandardCharsets.UTF_8));
        headers.setContentDisposition(ContentDisposition.attachment().filename(filename, StandardCharsets.UTF_8).build());
        return ResponseEntity.ok().headers(headers).body(body);
    }
}
