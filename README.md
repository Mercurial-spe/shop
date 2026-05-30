# Mercurial's Shop

姓名：肖湘玺  
学号：202330451951

[![Stack](https://skillicons.dev/icons?i=react,typescript,java,spring,mysql,nginx,docker,ubuntu&perline=9)](https://skillicons.dev)

Mercurial's Shop 是一个完整的电商演示系统，覆盖顾客购物、销售管理、平台运营、数据分析和线上部署。项目采用前后端分离架构：前端由 React + TypeScript + Vite 构建，后端基于 Spring Boot + Spring Data JPA，数据持久化使用 MySQL，并提供 Docker Compose 与 Nginx 生产部署路径。

**线上部署地址：** <https://www.mercuria1.top/>

## 功能概览

| 角色 | 能力 |
| --- | --- |
| 顾客 | 注册登录、商品浏览、关键词搜索、分类筛选、购物车、立即购买、订单支付、订单详情、个性化推荐 |
| 销售 | 商品上架、编辑商品、删除商品、库存与价格维护、商品分类管理、订单查看、销售统计、CSV 导入导出 |
| 管理员 | 销售账号管理、密码重置、演示数据重置、登录/浏览/购买/操作日志、销售趋势、异常监控、客户画像 |

## 项目亮点

- 多角色权限体系：顾客、销售、管理员拥有独立入口和工作台。
- 完整交易闭环：浏览、加购、下单、支付、库存扣减、订单追踪一体化。
- 数据分析面板：销售额、订单量、热卖排行、趋势图、异常行为和客户画像可视化。
- 推荐能力：结合浏览与购买日志生成用户推荐和相似商品推荐。
- CSV 工具链：销售端支持商品批量导入，管理员和销售端支持报表导出。
- 审计日志：记录登录、浏览、购买和关键后台操作，便于验收和问题追踪。
- 反爬与异常识别：后端包含访问频率限制、IP 解析和异常数据聚合。
- 邮件通知：支持 SMTP 订单邮件通知，可通过环境变量配置。
- 生产部署：支持 Ubuntu + Nginx + HTTPS + Spring Boot Jar + React 静态资源部署。

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | React 19、TypeScript、Vite/Rolldown、React Router、ECharts、Framer Motion |
| 后端 | Java 21、Spring Boot 4、Spring Web MVC、Spring Data JPA、Spring Mail、Spring Security Crypto |
| 数据库 | MySQL 8 |
| 部署 | Docker Compose、Nginx、Let's Encrypt、Ubuntu |

## 系统预览

系统架构：

![系统架构图](images/system_architecture_graph.png)

商品页面：

![商品列表](images/products_page.png)

## 目录结构

```text
web_application/
├─ shop-backend/             # Spring Boot 后端服务
│  ├─ src/main/java/          # Controller / Service / Repository / Model
│  ├─ src/main/resources/     # 应用配置
│  └─ pom.xml
├─ shop-frontend/            # React + TypeScript 前端
│  ├─ src/components/         # 复用组件
│  ├─ src/views/              # 顾客、销售、管理员页面
│  ├─ src/services/           # API 请求封装
│  ├─ src/routes/             # 前端路由
│  └─ package.json
├─ deploy/nginx/              # Nginx 站点配置
├─ scripts/                   # 本地环境、数据导入和开发脚本
├─ images/                    # README 展示图片
├─ docker-compose.yml
└─ README.md
```

## 快速启动

使用 Docker Compose 启动完整环境：

```bash
docker compose up --build
```

默认服务地址：

| 服务 | 地址 |
| --- | --- |
| 前端 | <http://localhost:5173> |
| 后端 | <http://localhost:8080> |
| MySQL | `localhost:3306` |

Docker Compose 支持通过环境变量覆盖默认配置：

```bash
MYSQL_DATABASE=shop_db \
MYSQL_USER=shop_user \
MYSQL_PASSWORD=shop_pass \
MYSQL_ROOT_PASSWORD=root \
FRONTEND_PORT=5173 \
docker compose up --build
```

如需启用订单邮件通知，在启动前设置 SMTP 环境变量：

```bash
export SMTP_HOST=smtp.qq.com
export SMTP_PORT=465
export SMTP_USER=your-email@example.com
export SMTP_PASS=your-smtp-token
docker compose up --build
```

## 本地开发

环境要求：

| 工具 | 版本建议 |
| --- | --- |
| Node.js | 20+ |
| Java | 21+ |
| Maven | 使用后端目录内的 `mvnw` |
| MySQL | 8+ |

初始化 WSL/Linux 本地环境：

```bash
./scripts/install-wsl-tools.sh
./scripts/setup-local-mysql.sh
./scripts/check-dev-env.sh --build
```

启动后端：

```bash
cd shop-backend
./mvnw spring-boot:run
```

启动前端：

```bash
cd shop-frontend
npm install
npm run dev
```

本地 MySQL 默认连接信息：

| 项目 | 值 |
| --- | --- |
| 地址 | `127.0.0.1` |
| 端口 | `3307` |
| 数据库 | `shop_db` |
| 用户 | `shop_user` |
| 密码 | `shop_pass` |

## 演示账号

| 角色 | 用户名 | 密码 | 用途 |
| --- | --- | --- | --- |
| 管理员 | `admin` | `admin123` | 查看运营分析、日志、异常和销售账号管理 |
| 销售 | `seller01` | `seller123` | 管理商品、分类、库存、订单和 CSV 报表 |
| 顾客 | `customer01` | `customer123` | 浏览商品、购物车、下单、支付和推荐 |

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `./scripts/dev-up.sh` | 本地同时启动前后端开发服务 |
| `./scripts/check-dev-env.sh --build` | 检查开发环境并尝试构建 |
| `./scripts/setup-local-mysql.sh` | 初始化本地 MySQL 数据库 |
| `./scripts/generate-products-csv.py` | 生成商品 CSV 导入样例 |

## 生产部署说明

推荐线上部署结构：

```text
Nginx
├─ /              -> React build 静态文件
├─ /api/          -> Spring Boot 后端 8080
└─ 商品图片路径    -> 后端静态资源代理

Spring Boot Jar -> MySQL 8
HTTPS           -> Let's Encrypt
```

Nginx 配置位于 `deploy/nginx/mercurial-shop.conf`。部署时需要确认：

- 域名已解析到服务器。
- 后端数据库连接、SMTP 账号等敏感配置通过环境变量或服务器本地配置注入。
- 前端生产构建输出由 Nginx 托管。
- `/api/` 和商品图片路径正确反向代理到后端服务。

干净 Ubuntu 服务器可按下面顺序复现部署：

```bash
./scripts/install-ubuntu-server.sh
./scripts/deploy-ubuntu-server.sh
```

`install-ubuntu-server.sh` 会安装 Java 21、Node.js 20、MySQL、Nginx、rsync 和可选 Certbot，并创建默认数据库账号。`deploy-ubuntu-server.sh` 会构建后端 Jar、构建前端静态文件、写入 systemd 服务、安装 Nginx 站点配置并重启服务。

常用部署变量：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `DB_NAME` | `shop_db` | MySQL 数据库名 |
| `DB_USER` | `shop_user` | 应用数据库用户 |
| `DB_PASSWORD` | `shop_pass` | 应用数据库密码 |
| `DB_HOST` | `127.0.0.1` | 后端连接的数据库地址 |
| `DB_PORT` | `3306` | 后端连接的数据库端口 |
| `APP_DIR` | `/opt/mercurial-shop` | 后端 Jar 安装目录 |
| `WEB_ROOT` | `/var/www/mercurial-shop` | 前端静态文件目录 |
| `SMTP_USER` / `SMTP_PASS` | 空 | 订单邮件账号和授权码 |

示例：

```bash
DB_PASSWORD='更安全的数据库密码' \
SMTP_USER='your-email@example.com' \
SMTP_PASS='your-smtp-token' \
./scripts/deploy-ubuntu-server.sh
```
