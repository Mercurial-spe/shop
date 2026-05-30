package com.example.shop_backend.util;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 基于离线 IP 归属前缀表的地域解析器。
 *
 * 说明：这里维护一张「IP 第一段（A 段）/前两段 → 中国地域」的简化离线映射表，
 * 取材于公开的国内主要骨干网与 ISP 地址段归属（CNNIC/APNIC 公开分配信息的粗粒度归纳）。
 * 它给出的是「按 IP 段推断的归属地域」，并非用户精确住址；私网或未命中返回「未知地区」。
 */
public final class IpRegionResolver {

    private IpRegionResolver() {
    }

    // 前两段精确匹配优先（更细），命中不了再退到 A 段。
    private static final Map<String, String> TWO_OCTET = new LinkedHashMap<>();
    private static final Map<Integer, String> ONE_OCTET = new LinkedHashMap<>();

    static {
        // 代表性的国内公网前两段前缀（粗粒度，演示用）。
        TWO_OCTET.put("219.135", "华南·广东");
        TWO_OCTET.put("113.108", "华南·广东");
        TWO_OCTET.put("183.61", "华南·广东");
        TWO_OCTET.put("123.125", "华北·北京");
        TWO_OCTET.put("111.206", "华北·北京");
        TWO_OCTET.put("114.247", "华北·北京");
        TWO_OCTET.put("101.226", "华东·上海");
        TWO_OCTET.put("180.153", "华东·上海");
        TWO_OCTET.put("115.239", "华东·浙江");
        TWO_OCTET.put("122.224", "华东·浙江");
        TWO_OCTET.put("125.69", "西南·四川");
        TWO_OCTET.put("171.221", "西南·四川");
        TWO_OCTET.put("117.136", "华中·湖北");
        TWO_OCTET.put("119.97", "华中·湖北");

        // A 段兜底（更粗），覆盖前两段未命中的情况。
        ONE_OCTET.put(219, "华南");
        ONE_OCTET.put(113, "华南");
        ONE_OCTET.put(183, "华南");
        ONE_OCTET.put(123, "华北");
        ONE_OCTET.put(111, "华北");
        ONE_OCTET.put(114, "华北");
        ONE_OCTET.put(101, "华东");
        ONE_OCTET.put(180, "华东");
        ONE_OCTET.put(115, "华东");
        ONE_OCTET.put(122, "华东");
        ONE_OCTET.put(125, "西南");
        ONE_OCTET.put(171, "西南");
        ONE_OCTET.put(117, "华中");
        ONE_OCTET.put(119, "华中");
    }

    public static String resolve(String ip) {
        if (ip == null || ip.isBlank()) {
            return "未知地区";
        }
        String trimmed = ip.trim();
        if (isPrivateOrLocal(trimmed)) {
            return "未知地区";
        }
        String[] parts = trimmed.split("\\.");
        if (parts.length < 2) {
            return "未知地区";
        }
        String twoKey = parts[0] + "." + parts[1];
        String byTwo = TWO_OCTET.get(twoKey);
        if (byTwo != null) {
            return byTwo;
        }
        try {
            String byOne = ONE_OCTET.get(Integer.parseInt(parts[0]));
            if (byOne != null) {
                return byOne;
            }
        } catch (NumberFormatException ignored) {
            return "未知地区";
        }
        return "未知地区";
    }

    private static boolean isPrivateOrLocal(String ip) {
        return ip.startsWith("10.")
                || ip.startsWith("192.168.")
                || ip.startsWith("127.")
                || ip.startsWith("172.16.")
                || ip.startsWith("172.17.")
                || ip.startsWith("172.18.")
                || ip.startsWith("172.19.")
                || ip.startsWith("172.2")
                || ip.startsWith("172.30.")
                || ip.startsWith("172.31.")
                || ip.equals("0.0.0.0")
                || ip.startsWith("::");
    }
}
