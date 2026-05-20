package com.example.shop_backend.service;

import com.example.shop_backend.model.Product;
import com.example.shop_backend.model.User;
import com.example.shop_backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AccessControlService accessControlService;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getProductsBySeller(Long sellerId) {
        User seller = accessControlService.requireSeller(sellerId);
        return productRepository.findBySeller(seller);
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product createProduct(Product product, Long sellerId) {
        User seller = accessControlService.requireSeller(sellerId);
        product.setSeller(seller);
        return productRepository.save(product);
    }

    public Optional<Product> updateProduct(Long id, Product productDetails, Long sellerId) {
        User seller = accessControlService.requireSeller(sellerId);
        return productRepository.findById(id).map(product -> {
            if (product.getSeller() == null || !product.getSeller().getId().equals(seller.getId())) {
                throw new RuntimeException("只能修改自己发布的商品");
            }
            product.setName(productDetails.getName());
            product.setDescription(productDetails.getDescription());
            product.setPrice(productDetails.getPrice());
            product.setCategory(productDetails.getCategory());
            product.setImageUrl(productDetails.getImageUrl());
            product.setStockQuantity(productDetails.getStockQuantity());
            return productRepository.save(product);
        });
    }

    public boolean deleteProduct(Long id, Long sellerId) {
        User seller = accessControlService.requireSeller(sellerId);
        return productRepository.findById(id).map(product -> {
            if (product.getSeller() == null || !product.getSeller().getId().equals(seller.getId())) {
                throw new RuntimeException("只能删除自己发布的商品");
            }
            productRepository.delete(product);
            return true;
        }).orElse(false);
    }

}

