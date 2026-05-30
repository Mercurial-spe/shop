#!/usr/bin/env python3
"""合成商品导入 CSV 生成脚本。

用法：
    python3 scripts/generate-products-csv.py [数量] [输出文件]

默认生成 30 行到 scripts/sample-products-import.csv。
列顺序与后端导入接口要求一致：
    商品名称,类别,价格,库存,描述,图片链接
导入接口：POST /api/export/seller/products/import?sellerId=<销售人员ID>
请求体为 CSV 纯文本。
"""
import csv
import random
import sys

HEADER = ["商品名称", "类别", "价格", "库存", "描述", "图片链接"]

CATEGORIES = {
    "手机数码": ["旗舰手机", "影像手机", "折叠屏", "电竞手机", "轻薄手机"],
    "电脑办公": ["商务笔记本", "游戏本", "一体机", "便携显示器", "无线键鼠套装"],
    "智能配件": ["快充头", "蓝牙耳机", "移动电源", "数据线", "车载支架"],
    "智能穿戴": ["运动手表", "健康手环", "智能眼镜", "睡眠监测环", "儿童手表"],
    "影音娱乐": ["蓝牙音箱", "降噪耳机", "投影仪", "游戏手柄", "麦克风"],
}

ADJ = ["Aurora", "Nebula", "Pulse", "Orbit", "Vertex", "Lumen", "Quartz", "Zephyr", "Comet", "Halo"]
SUFFIX = ["Pro", "Air", "Max", "Mini", "Plus", "X", "Lite", "Ultra", "Go", "Neo"]
IMAGE = "/100191209_p0.jpg"


def make_rows(count):
    rows = []
    for _ in range(count):
        category = random.choice(list(CATEGORIES.keys()))
        kind = random.choice(CATEGORIES[category])
        name = f"{random.choice(ADJ)} {kind} {random.choice(SUFFIX)}"
        price = round(random.choice([49, 99, 199, 399, 699, 1299, 1999, 3999, 6999, 8999]) + random.random() * 100, 2)
        stock = random.choice([2, 5, 8, 12, 20, 35, 50, 88, 120, 200])
        desc = f"{category}演示商品，用于课程数据导入测试。"
        rows.append([name, category, price, stock, desc, IMAGE])
    return rows


def main():
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 30
    out_path = sys.argv[2] if len(sys.argv) > 2 else "scripts/sample-products-import.csv"

    with open(out_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(HEADER)
        writer.writerows(make_rows(count))

    print(f"已生成 {count} 行商品数据 -> {out_path}")
    print("导入命令示例：")
    print('  curl -X POST "http://localhost:8080/api/export/seller/products/import?sellerId=2" \\')
    print(f'       -H "Content-Type: text/plain;charset=UTF-8" --data-binary @{out_path}')


if __name__ == "__main__":
    main()
