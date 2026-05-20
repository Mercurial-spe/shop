package com.example.shop_backend.service;

import com.example.shop_backend.model.User;
import com.example.shop_backend.model.UserRole;
import com.example.shop_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AccessControlService {

    @Autowired
    private UserRepository userRepository;

    public User requireCustomer(Long userId) {
        return requireRole(userId, UserRole.CUSTOMER, "只有顾客可以执行该操作");
    }

    public User requireSeller(Long userId) {
        return requireRole(userId, UserRole.SELLER, "只有销售人员可以执行该操作");
    }

    public User requireAdmin(Long userId) {
        return requireRole(userId, UserRole.ADMIN, "只有管理员可以执行该操作");
    }

    private User requireRole(Long userId, UserRole role, String message) {
        if (userId == null) {
            throw new RuntimeException("账号不存在");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("账号不存在"));
        if (user.getRole() != role) {
            throw new RuntimeException(message);
        }
        return user;
    }
}
