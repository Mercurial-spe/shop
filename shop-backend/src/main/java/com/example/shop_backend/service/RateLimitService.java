package com.example.shop_backend.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 简化版反爬虫：基于内存的滑动窗口按 IP 限流。
 * - 在 WINDOW_MS 时间窗口内统计每个 IP 的请求次数；
 * - 超过 LIMIT 次则在 BLOCK_MS 内拒绝该 IP（返回 429）；
 * - 记录命中限流的 IP 及次数，供异常监控大屏展示「反爬虫拦截」。
 * 课程演示级实现：单机内存、无分布式、无持久化。
 */
@Service
public class RateLimitService {

    private static final long WINDOW_MS = 10_000;   // 10 秒滑动窗口
    private static final int LIMIT = 60;            // 窗口内最多 60 次请求
    private static final long BLOCK_MS = 30_000;    // 触发后封禁 30 秒

    private final Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();
    private final Map<String, Long> blockedUntil = new ConcurrentHashMap<>();
    private final Map<String, BlockStat> blockStats = new ConcurrentHashMap<>();

    /** 返回 true 表示放行，false 表示已被限流（应拒绝）。 */
    public boolean allow(String ip) {
        if (ip == null || ip.isBlank()) {
            return true;
        }
        long now = Instant.now().toEpochMilli();

        Long until = blockedUntil.get(ip);
        if (until != null && now < until) {
            recordBlock(ip, now);
            return false;
        }

        Deque<Long> timestamps = hits.computeIfAbsent(ip, key -> new ArrayDeque<>());
        synchronized (timestamps) {
            long windowStart = now - WINDOW_MS;
            while (!timestamps.isEmpty() && timestamps.peekFirst() < windowStart) {
                timestamps.pollFirst();
            }
            timestamps.addLast(now);
            if (timestamps.size() > LIMIT) {
                blockedUntil.put(ip, now + BLOCK_MS);
                recordBlock(ip, now);
                return false;
            }
        }
        return true;
    }

    private void recordBlock(String ip, long now) {
        BlockStat stat = blockStats.computeIfAbsent(ip, key -> new BlockStat());
        synchronized (stat) {
            stat.count++;
            stat.lastBlockedAt = now;
        }
    }

    public long retryAfterSeconds(String ip) {
        Long until = blockedUntil.get(ip);
        if (until == null) {
            return BLOCK_MS / 1000;
        }
        long remaining = until - Instant.now().toEpochMilli();
        return Math.max(1, remaining / 1000);
    }

    /** 供异常监控读取：近期被限流的 IP 列表（按拦截次数降序）。 */
    public List<Map<String, Object>> recentBlocks(int limit) {
        long now = Instant.now().toEpochMilli();
        List<Map<String, Object>> result = new ArrayList<>();
        blockStats.entrySet().stream()
                .sorted(Comparator.comparingInt((Map.Entry<String, BlockStat> e) -> e.getValue().count).reversed())
                .limit(limit)
                .forEach(entry -> {
                    BlockStat stat = entry.getValue();
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("ipAddress", entry.getKey());
                    item.put("blockedCount", stat.count);
                    item.put("active", blockedUntil.getOrDefault(entry.getKey(), 0L) > now);
                    result.add(item);
                });
        return result;
    }

    public int blockedIpCount() {
        return blockStats.size();
    }

    private static class BlockStat {
        private int count;
        private long lastBlockedAt;
    }
}
