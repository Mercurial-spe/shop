package com.example.shop_backend.service;

import com.example.shop_backend.model.User;
import com.example.shop_backend.model.UserRole;
import com.example.shop_backend.repository.ProductRepository;
import com.example.shop_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> listSellers(Long adminId) {
        requireAdmin(adminId);
        return userRepository.findByRoleOrderByUsernameAsc(UserRole.SELLER);
    }

    public User createSeller(Long adminId, String username, String email, String rawPassword) {
        requireAdmin(adminId);
        validateSellerInput(username, email, rawPassword);
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("用户名已存在");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("邮箱已存在");
        }

        User seller = new User();
        seller.setUsername(username);
        seller.setEmail(email);
        seller.setPassword(passwordEncoder.encode(rawPassword));
        seller.setRole(UserRole.SELLER);
        return userRepository.save(seller);
    }

    @Transactional
    public void deleteSeller(Long adminId, Long sellerId) {
        requireAdmin(adminId);
        User seller = requireSeller(sellerId);
        if (productRepository.existsBySeller(seller)) {
            throw new RuntimeException("该销售人员仍有关联商品，不能直接删除");
        }
        userRepository.delete(seller);
    }

    public User resetSellerPassword(Long adminId, Long sellerId, String rawPassword) {
        requireAdmin(adminId);
        if (rawPassword == null || rawPassword.length() < 6) {
            throw new RuntimeException("新密码至少需要 6 位");
        }
        User seller = requireSeller(sellerId);
        seller.setPassword(passwordEncoder.encode(rawPassword));
        return userRepository.save(seller);
    }

    private User requireAdmin(Long adminId) {
        if (adminId == null) {
            throw new RuntimeException("管理员账号不存在");
        }
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("管理员账号不存在"));
        if (admin.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("只有管理员可以执行该操作");
        }
        return admin;
    }

    private User requireSeller(Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("销售人员不存在"));
        if (seller.getRole() != UserRole.SELLER) {
            throw new RuntimeException("目标账号不是销售人员");
        }
        return seller;
    }

    private void validateSellerInput(String username, String email, String rawPassword) {
        if (username == null || username.isBlank()) {
            throw new RuntimeException("用户名不能为空");
        }
        if (email == null || email.isBlank()) {
            throw new RuntimeException("邮箱不能为空");
        }
        if (rawPassword == null || rawPassword.length() < 6) {
            throw new RuntimeException("密码至少需要 6 位");
        }
    }
}
