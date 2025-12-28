package com.example.shop_backend.service;

import com.example.shop_backend.model.Order;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOrderConfirmation(Order order) {
        if (order.getUser() == null || order.getUser().getEmail() == null) {
            System.out.println("邮件发送失败：用户邮箱为空");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(fromEmail, "mercuria1");
            helper.setTo(order.getUser().getEmail());
            helper.setSubject("订单已发货 - Mercurial's Shop");
            helper.setText("您的订单已发货。\n如需确认收货，请回复该邮箱。\n感谢您的购买。");
            mailSender.send(message);
        } catch (MessagingException e) {
            System.out.println("邮件发送失败: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("邮件发送异常: " + e.getMessage());
        }
    }
}
