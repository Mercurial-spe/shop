package com.example.shop_backend.config;

import com.example.shop_backend.service.RateLimitService;
import com.example.shop_backend.util.RequestIpUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 反爬虫限流拦截器：对 /api/** 请求按来源 IP 做滑动窗口限流，
 * 超过阈值返回 429 Too Many Requests。
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimitService rateLimitService;

    public RateLimitInterceptor(RateLimitService rateLimitService) {
        this.rateLimitService = rateLimitService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String ip = RequestIpUtil.clientIp(request);
        if (rateLimitService.allow(ip)) {
            return true;
        }
        response.setStatus(429); // 429 Too Many Requests
        response.setHeader("Retry-After", String.valueOf(rateLimitService.retryAfterSeconds(ip)));
        response.setContentType("text/plain;charset=UTF-8");
        response.getWriter().write("请求过于频繁，已触发反爬虫限流，请稍后再试。");
        return false;
    }
}
