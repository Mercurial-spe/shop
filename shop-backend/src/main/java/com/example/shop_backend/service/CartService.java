package com.example.shop_backend.service;

import com.example.shop_backend.model.CartItem;
import com.example.shop_backend.model.Product;
import com.example.shop_backend.model.User;
import com.example.shop_backend.repository.CartItemRepository;
import com.example.shop_backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Cart Service implementation
 */
@Service
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderService orderService;

    @Autowired
    private AccessControlService accessControlService;

    public List<CartItem> getCartByUser(Long userId) {
        User user = accessControlService.requireCustomer(userId);
        return cartItemRepository.findByUser(user);
    }

    public CartItem addToCart(Long userId, Long productId, Integer quantity) {
        User user = accessControlService.requireCustomer(userId);
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("商品不存在"));
        if (quantity == null || quantity <= 0) {
            throw new RuntimeException("商品数量必须大于 0");
        }

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

    public void removeFromCart(Long userId, Long cartItemId) {
        User user = accessControlService.requireCustomer(userId);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("购物车商品不存在"));
        if (!item.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("无权操作该购物车商品");
        }
        cartItemRepository.delete(item);
    }

    @Transactional
    public void clearCart(Long userId) {
        User user = accessControlService.requireCustomer(userId);
        cartItemRepository.deleteByUser(user);
    }

    @Transactional
    public void checkout(Long userId) {
        User user = accessControlService.requireCustomer(userId);
        List<CartItem> items = cartItemRepository.findByUser(user);
        if (items.isEmpty()) {
            throw new RuntimeException("购物车为空");
        }
        orderService.checkout(userId, items);
        cartItemRepository.deleteByUser(user);
    }
}
