# 🛍️ 购物网站 Demo

一个基于 Spring Boot + React 的简单购物网站演示项目。

## 项目结构

```
web_application/
├── shop-backend/          # Spring Boot 后端
│   ├── src/main/java/com/example/shop_backend/
│   │   ├── controller/    # REST 控制器
│   │   ├── model/         # 数据模型
│   │   ├── repository/    # 数据访问层
│   │   └── config/        # 配置类
│   └── src/main/resources/
│       ├── application.properties  # 数据库配置
│       └── data.sql               # 初始数据
└── shop-frontend/         # React 前端
    └── src/
        ├── components/    # React 组件
        ├── services/      # API 服务
        └── types/         # TypeScript 类型定义
```

## 技术栈

### 后端
- **Spring Boot 4.0** - 主框架
- **Spring Data JPA** - 数据访问
- **MySQL** - 数据库
- **Lombok** - 代码简化

### 前端
- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具

## 快速开始

### 环境要求

- Java 21+
- Node.js 18+
- MySQL 8.0+

### 1. 启动后端

```bash
# 进入后端目录
cd shop-backend

# 确保 MySQL 服务正在运行，并创建数据库
# CREATE DATABASE shop_db;

# 运行 Spring Boot 应用
./mvnw spring-boot:run
```

后端将在 `http://localhost:8080` 启动。

### 2. 启动前端

```bash
# 进入前端目录
cd shop-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将在 `http://localhost:5173` 启动。

### 3. 访问应用

打开浏览器访问 `http://localhost:5173`，您应该能看到：
- 购物网站首页
- 商品列表展示
- 基本的购物界面

## API 接口

### 商品相关接口

- `GET /api/products` - 获取所有商品
- `GET /api/products/{id}` - 获取单个商品
- `POST /api/products` - 创建新商品
- `PUT /api/products/{id}` - 更新商品
- `DELETE /api/products/{id}` - 删除商品

## 数据库配置

默认配置在 `shop-backend/src/main/resources/application.properties` 中：

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/shop_db
spring.datasource.username=root
spring.datasource.password=yuzaoqian521
```

请根据您的 MySQL 配置修改数据库连接信息。

## 开发说明

### 添加新功能

1. **后端**: 在相应包中添加新的 Controller、Service、Repository
2. **前端**: 在 `src/components` 中添加新组件，在 `src/services` 中添加 API 调用

### 数据库迁移

应用启动时会自动创建表结构和初始化数据（见 `data.sql`）。

## 故障排除

### 前端无法连接后端

1. 确认后端正在运行（`http://localhost:8080`）
2. 检查 CORS 配置
3. 查看浏览器控制台错误信息

### 数据库连接失败

1. 确认 MySQL 服务正在运行
2. 检查数据库连接配置
3. 确认数据库 `shop_db` 已创建

## 许可证

MIT License
