package com.example.shop_backend;

import com.example.shop_backend.model.User;
import com.example.shop_backend.model.UserRole;
import com.example.shop_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ShopBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ShopBackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(UserRepository userRepository) {
		return args -> {
			if (userRepository.findByUsername("admin").isEmpty()) {
				User user = new User();
				user.setUsername("admin");
				user.setPassword("123456");
				user.setEmail("524307197@qq.com");
				user.setRole(UserRole.SELLER);
				userRepository.save(user);
				System.out.println("Default user created: admin/123456");
			}

			if (userRepository.findByUsername("buyer").isEmpty()) {
				User user = new User();
				user.setUsername("buyer");
				user.setPassword("123456");
				user.setEmail("buyer@example.com");
				user.setRole(UserRole.CUSTOMER);
				userRepository.save(user);
				System.out.println("Default user created: buyer/123456");
			}
		};
	}
}
