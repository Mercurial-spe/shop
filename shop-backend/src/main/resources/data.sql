DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM cart_items;
DELETE FROM products;
DELETE FROM users;

INSERT INTO users (id, username, password, email, role) VALUES
(1, 'admin', '123456', '524307197@qq.com', 'SELLER'),
(2, 'buyer', '123456', 'buyer@example.com', 'CUSTOMER');

-- 使用相对路径，不带域名和端口
INSERT INTO products (name, description, price, image_url, stock_quantity, seller_id) VALUES
('iPhone 15 Pro', '最新款苹果手机，A17 Pro芯片，钛金属机身', 7999.00, '/100191209_p0.jpg', 50, 1),
('MacBook Air M3', '13英寸MacBook Air，M3芯片，超薄轻便', 8999.00, '/100191209_p0.jpg', 30, 1),
('AirPods Pro', '主动降噪耳机，空间音频，MagSafe充电盒', 1999.00, '/100191209_p0.jpg', 100, 1),
('iPad Air', '10.9英寸iPad Air，M2芯片，多任务处理', 4999.00, '/100191209_p0.jpg', 25, 1),
('Apple Watch Series 9', '智能手表，健康监测，GPS定位', 2999.00, '/100191209_p0.jpg', 40, 1),
('USB-C Fast Cable', '耐用编织快充线', 25.00, '/100191209_p0.jpg', 200, 1),
('Screen Cleaning Kit', '高级清洁布与喷雾', 15.99, '/100191209_p0.jpg', 150, 1),
('Limited Edition Case', 'iPhone 15 Pro 限量版保护壳', 45.00, '/100191209_p0.jpg', 3, 1),
('Mechanical Keycap', '手工定制键帽', 29.00, '/100191209_p0.jpg', 2, 1);
