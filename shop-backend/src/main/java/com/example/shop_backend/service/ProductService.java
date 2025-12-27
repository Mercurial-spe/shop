package com.example.shop_backend.service;

import com.example.shop_backend.model.Product;
import com.example.shop_backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Optional<Product> updateProduct(Long id, Product productDetails) {
        return productRepository.findById(id).map(product -> {
            product.setName(productDetails.getName());
            product.setDescription(productDetails.getDescription());
            product.setPrice(productDetails.getPrice());
            product.setImageUrl(productDetails.getImageUrl());
            product.setStockQuantity(productDetails.getStockQuantity());
            return productRepository.save(product);
        });
    }

    public boolean deleteProduct(Long id) {
        return productRepository.findById(id).map(product -> {
            productRepository.delete(product);
            return true;
        }).orElse(false);
    }

    @Transactional
    public Optional<Product> purchaseProduct(Long id, int quantity) {
        return productRepository.findById(id).map(product -> {
            Integer stock = product.getStockQuantity();
            if (stock != null) {
                int remaining = stock - quantity;
                if (remaining < 0) {
                    throw new RuntimeException("Insufficient stock");
                }
                product.setStockQuantity(remaining);
            }
            return productRepository.save(product);
        });
    }
}

