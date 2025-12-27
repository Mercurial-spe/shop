package com.example.shop_backend.service;

import com.example.shop_backend.model.CartItem;
import com.example.shop_backend.model.Product;
import com.example.shop_backend.model.User;
import com.example.shop_backend.repository.CartItemRepository;
import com.example.shop_backend.repository.ProductRepository;
import com.example.shop_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<CartItem> getCartByUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return cartItemRepository.findByUser(user);
    }

    public CartItem addToCart(Long userId, Long productId, Integer quantity) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<CartItem> existingItem = cartItemRepository.findByUserAndProductId(user, productId);

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            return cartItemRepository.save(item);
        } else {
            CartItem item = new CartItem();
            item.setUser(user);
            item.setProduct(product);
            item.setQuantity(quantity);
            return cartItemRepository.save(item);
        }
    }

    public void removeFromCart(Long cartItemId) {
        cartItemRepository.deleteById(cartItemId);
    }

    @Transactional
    public void clearCart(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        cartItemRepository.deleteByUser(user);
    }

    @Transactional
    public void checkout(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        List<CartItem> items = cartItemRepository.findByUser(user);

        for (CartItem item : items) {
            Product product = item.getProduct();
            Integer stock = product.getStockQuantity();
            if (stock == null) {
                continue;
            }
            int remaining = stock - item.getQuantity();
            if (remaining < 0) {
                throw new RuntimeException("Insufficient stock");
            }
            product.setStockQuantity(remaining);
            productRepository.save(product);
        }

        cartItemRepository.deleteByUser(user);
    }
}
