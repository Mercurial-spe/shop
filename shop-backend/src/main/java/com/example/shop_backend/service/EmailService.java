package com.example.shop_backend.service;

import com.example.shop_backend.model.Order;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    public void sendOrderConfirmation(Order order) {
        System.out.println("发送邮件确认: 订单号 " + order.getId() + " 状态 " + order.getStatus());
    }
}
