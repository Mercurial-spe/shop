package com.example.shop_backend.service;

import com.example.shop_backend.model.Product;
import com.example.shop_backend.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 商品 CSV 批量导入。
 * 期望表头（顺序固定，首行）：商品名称,类别,价格,库存,描述,图片链接
 * - 复用 ProductService.createProduct 创建商品（含 SELLER 校验）；
 * - 类别若不存在则自动创建（ProductCategoryService.ensureCategory）；
 * - 逐行校验，单行失败不影响其它行，返回成功数与失败明细。
 */
@Service
public class CsvImportService {

    private static final List<String> EXPECTED_HEADER = List.of("商品名称", "类别", "价格", "库存", "描述", "图片链接");

    @Autowired
    private AccessControlService accessControlService;

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductCategoryService categoryService;

    public Map<String, Object> importProducts(Long sellerId, String csvContent) {
        User seller = accessControlService.requireSeller(sellerId);
        if (csvContent == null || csvContent.isBlank()) {
            throw new RuntimeException("CSV 内容为空");
        }

        List<String> lines = splitLines(stripBom(csvContent));
        if (lines.isEmpty()) {
            throw new RuntimeException("CSV 没有有效内容");
        }

        validateHeader(parseLine(lines.get(0)));

        int imported = 0;
        List<Map<String, Object>> failures = new ArrayList<>();
        for (int i = 1; i < lines.size(); i++) {
            String raw = lines.get(i);
            if (raw.isBlank()) {
                continue;
            }
            int rowNumber = i + 1; // 含表头的人类行号
            try {
                List<String> cells = parseLine(raw);
                Product product = toProduct(cells);
                categoryService.ensureCategory(product.getCategory(), seller);
                productService.createProduct(product, seller.getId());
                imported++;
            } catch (RuntimeException e) {
                failures.add(failure(rowNumber, e.getMessage()));
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("imported", imported);
        result.put("failed", failures.size());
        result.put("failures", failures);
        return result;
    }

    private void validateHeader(List<String> header) {
        for (int i = 0; i < EXPECTED_HEADER.size(); i++) {
            String actual = i < header.size() ? header.get(i).trim() : "";
            if (!EXPECTED_HEADER.get(i).equals(actual)) {
                throw new RuntimeException("表头不正确，应为：" + String.join(",", EXPECTED_HEADER));
            }
        }
    }

    private Product toProduct(List<String> cells) {
        String name = cell(cells, 0);
        String category = cell(cells, 1);
        String priceText = cell(cells, 2);
        String stockText = cell(cells, 3);
        String description = cell(cells, 4);
        String imageUrl = cell(cells, 5);

        if (name.isBlank()) {
            throw new RuntimeException("商品名称不能为空");
        }
        if (category.isBlank()) {
            throw new RuntimeException("类别不能为空");
        }
        double price = parsePositiveDouble(priceText, "价格");
        int stock = parseNonNegativeInt(stockText, "库存");

        Product product = new Product();
        product.setName(name);
        product.setCategory(category);
        product.setPrice(price);
        product.setStockQuantity(stock);
        product.setDescription(description.isBlank() ? name : description);
        product.setImageUrl(imageUrl.isBlank() ? "/100191209_p0.jpg" : imageUrl);
        return product;
    }

    private double parsePositiveDouble(String text, String field) {
        try {
            double value = Double.parseDouble(text.trim());
            if (value < 0) {
                throw new RuntimeException(field + "不能为负数");
            }
            return value;
        } catch (NumberFormatException e) {
            throw new RuntimeException(field + "不是合法数字：" + text);
        }
    }

    private int parseNonNegativeInt(String text, String field) {
        try {
            int value = Integer.parseInt(text.trim());
            if (value < 0) {
                throw new RuntimeException(field + "不能为负数");
            }
            return value;
        } catch (NumberFormatException e) {
            throw new RuntimeException(field + "不是合法整数：" + text);
        }
    }

    private Map<String, Object> failure(int rowNumber, String reason) {
        Map<String, Object> failure = new LinkedHashMap<>();
        failure.put("row", rowNumber);
        failure.put("reason", reason);
        return failure;
    }

    private String cell(List<String> cells, int index) {
        return index < cells.size() ? cells.get(index).trim() : "";
    }

    private String stripBom(String content) {
        if (!content.isEmpty() && content.charAt(0) == '﻿') {
            return content.substring(1);
        }
        return content;
    }

    private List<String> splitLines(String content) {
        List<String> lines = new ArrayList<>();
        for (String line : content.replace("\r\n", "\n").replace('\r', '\n').split("\n", -1)) {
            lines.add(line);
        }
        // 去掉末尾可能的空行
        while (!lines.isEmpty() && lines.get(lines.size() - 1).isBlank()) {
            lines.remove(lines.size() - 1);
        }
        return lines;
    }

    /** 解析单行 CSV，支持双引号包裹与转义（""）。 */
    private List<String> parseLine(String line) {
        List<String> cells = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (inQuotes) {
                if (c == '"') {
                    if (i + 1 < line.length() && line.charAt(i + 1) == '"') {
                        current.append('"');
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    current.append(c);
                }
            } else if (c == '"') {
                inQuotes = true;
            } else if (c == ',') {
                cells.add(current.toString());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        cells.add(current.toString());
        return cells;
    }
}
