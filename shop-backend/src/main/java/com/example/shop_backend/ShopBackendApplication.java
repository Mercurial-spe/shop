package com.example.shop_backend;

import com.example.shop_backend.model.Product;
import com.example.shop_backend.model.User;
import com.example.shop_backend.model.UserRole;
import com.example.shop_backend.repository.ProductRepository;
import com.example.shop_backend.repository.UserRepository;
import com.example.shop_backend.service.ProductCategoryService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@EnableScheduling
public class ShopBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ShopBackendApplication.class, args);
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public CommandLineRunner initData(
			UserRepository userRepository,
			ProductRepository productRepository,
			ProductCategoryService categoryService,
			PasswordEncoder passwordEncoder
	) {
		return args -> {
			User admin = ensureUser(userRepository, passwordEncoder, "admin", "admin123", "admin@example.com", UserRole.ADMIN);
			User seller01 = ensureUser(userRepository, passwordEncoder, "seller01", "seller123", "seller01@example.com", UserRole.SELLER);
			User seller02 = ensureUser(userRepository, passwordEncoder, "seller02", "seller123", "seller02@example.com", UserRole.SELLER);
			ensureUser(userRepository, passwordEncoder, "customer01", "customer123", "customer01@example.com", UserRole.CUSTOMER);
			ensureUser(userRepository, passwordEncoder, "customer02", "customer123", "customer02@example.com", UserRole.CUSTOMER);

			ensureDefaultCategories(categoryService, seller01);

			if (productRepository.count() == 0) {
				createProduct(productRepository, seller01, "Aurora Phone Pro", "高性能影像旗舰手机，适合演示热销电子产品。", 6999.00, 42, "手机数码");
				createProduct(productRepository, seller01, "Nebula Laptop Air", "轻薄办公笔记本，适合作为高客单价商品。", 8299.00, 28, "电脑办公");
				createProduct(productRepository, seller01, "Pulse Wireless Earbuds", "主动降噪无线耳机，适合推荐系统展示。", 1299.00, 96, "智能配件");
				createProduct(productRepository, seller02, "Orbit Smart Watch", "健康监测智能手表，适合销量趋势展示。", 1899.00, 35, "智能穿戴");
				createProduct(productRepository, seller02, "Metro Mechanical Keyboard", "办公与游戏两用机械键盘。", 499.00, 18, "电脑办公");
				createProduct(productRepository, seller02, "Pocket Power Bank", "轻薄快充移动电源，低价高频消费品。", 159.00, 3, "智能配件");
			} else {
				productRepository.findAll().forEach(product -> {
					if (product.getCategory() == null || product.getCategory().isBlank()) {
						product.setCategory(inferCategory(product.getName()));
						productRepository.save(product);
					}
				});
			}
		};
	}

	private void ensureDefaultCategories(ProductCategoryService categoryService, User creator) {
		categoryService.ensureCategory("手机数码", creator);
		categoryService.ensureCategory("电脑办公", creator);
		categoryService.ensureCategory("智能配件", creator);
		categoryService.ensureCategory("智能穿戴", creator);
	}

	private User ensureUser(
			UserRepository userRepository,
			PasswordEncoder passwordEncoder,
			String username,
			String rawPassword,
			String email,
			UserRole role
	) {
		User user = userRepository.findByUsername(username).orElseGet(User::new);
		user.setUsername(username);
		user.setPassword(passwordEncoder.encode(rawPassword));
		user.setEmail(email);
		user.setRole(role);
		return userRepository.save(user);
	}

	private void createProduct(ProductRepository productRepository, User seller, String name, String description, Double price, Integer stock, String category) {
		Product product = new Product();
		product.setName(name);
		product.setDescription(description);
		product.setPrice(price);
		product.setCategory(category);
		product.setImageUrl("/100191209_p0.jpg");
		product.setStockQuantity(stock);
		product.setSeller(seller);
		productRepository.save(product);
	}

	private String inferCategory(String name) {
		if (name == null) {
			return "未分类";
		}
		String lowerName = name.toLowerCase();
		if (lowerName.contains("phone")) {
			return "手机数码";
		}
		if (lowerName.contains("laptop") || lowerName.contains("keyboard")) {
			return "电脑办公";
		}
		if (lowerName.contains("watch")) {
			return "智能穿戴";
		}
		return "智能配件";
	}
}
