# iFlow 上下文文档 - MA Malnu Kananga 项目

## 项目概述

这是一个为印度尼西亚万丹省潘德格朗市 Kananga 镇的 Madrasah Aliyah Malnu Kananga 学校开发的现代化网站和门户系统。该网站采用移动优先、AI 集成的方法构建，提供交互式用户体验。

### 核心特性

- **公共网站**: 现代化、响应迅速的信息页面。
- **AI 助手 (RAG)**: 由 Google Gemini 驱动的交互式聊天机器人。
- **无密码登录系统**: 使用 "Magic Link" 进行安全身份验证。
- **学生门户**: 学生访问学术信息的个人区域。
- **教师门户**: 教师的内容管理界面。
- **家长门户**: 监控孩子学业的平台，支持实时沟通。
- **PWA (渐进式 Web 应用)**: 可安装的类原生应用。

### 技术栈

#### 前端
- **React 19**: 使用 hooks 和并发特性的核心库
- **TypeScript**: 严格的类型检查确保最大可靠性
- **Tailwind CSS**: 实用优先的 CSS 框架，带有自定义设计系统
- **Vite**: 极速构建工具，支持热模块替换 (HMR)
- **PWA**: Service Worker、Web App Manifest、离线功能

#### 后端与基础设施 (无服务器)
- **Cloudflare Workers**: 全球边缘计算的 JavaScript 运行时
- **Cloudflare D1**: 与 SQLite 兼容的无服务器 SQL 数据库
- **Cloudflare Vectorize**: 用于 AI RAG 系统的向量数据库
- **Google Gemini AI**: 用于聊天和内容生成的大型语言模型

#### 开发与测试
- **Jest**: 现代化测试框架
- **ESLint + Prettier**: 代码质量和格式化工具

## 项目结构

```
📦 malnu-kananga/
├── 📂 src/                          # 主源代码
│   ├── 📂 components/               # React 组件 (40+ 文件)
│   │   ├── 📂 icons/                # 自定义 SVG 图标
│   │   ├── ChatWindow.tsx           # AI 聊天界面
│   │   ├── StudentDashboard.tsx     # 学生门户
│   │   ├── TeacherDashboard.tsx     # 教师门户
│   │   ├── ParentDashboard.tsx      # 家长门户
│   │   ├── AssignmentSubmission.tsx # 数字作业提交
│   │   └── PwaInstallPrompt.tsx     # PWA 安装
│   ├── 📂 services/                 # 业务逻辑 & API
│   │   ├── 📂 api/                  # API 服务层
│   │   ├── geminiService.ts         # Google Gemini 集成
│   │   ├── authService.ts           # Magic Link 身份验证
│   │   └── messagingService.ts      # 家长-教师沟通
│   ├── 📂 hooks/                    # 自定义 React hooks
│   ├── 📂 memory/                   # 记忆库系统
│   ├── 📂 data/                     # 静态数据和内容
│   │   ├── parentData.ts             # 家长门户数据
│   │   ├── studentData.ts            # 学生学术数据
│   │   └── teacherData.ts            # 教师门户数据
│   └── 📂 utils/                    # 工具函数
├── 📂 public/                       # 静态资源
│   ├── manifest.json                # PWA 清单
│   └── sw.js                        # Service Worker
├── 📂 .github/                      # GitHub 工作流
├── worker.js                        # Cloudflare Worker (生产环境)
├── package.json                     # 依赖和脚本
├── vite.config.ts                   # Vite 配置
├── tsconfig.json                    # TypeScript 配置
└── README.md                        # 项目文档
```

## 构建与运行

### 开发环境设置

1. **克隆和安装**:
```bash
git clone <repository-url>
cd malnu-kananga
npm install
```

2. **环境配置**:
```bash
cp .env.example .env
# 在 .env 中添加您的 Gemini API 密钥
```

3. **运行开发服务器**:
```bash
npm run dev -- --port 9000
# 服务器将在 http://localhost:9000 运行
```

### 测试

```bash
npm run test          # 运行所有测试
npm run test:watch    # 开发时的监听模式
npm run test:coverage # 覆盖率报告
```

### 生产构建

```bash
npm run build         # 生产构建
npm run preview       # 预览生产构建
```

## 部署说明

### 前提条件
- **Node.js**: 版本 18+ (使用 nvm 进行版本管理)
- **Cloudflare 账户**: 免费层级足以用于开发
- **Google Gemini API 密钥**: AI 功能必需
- **Wrangler CLI**: Cloudflare 的命令行工具

### Cloudflare Worker 设置

1. **安装 Wrangler CLI**
```bash
npm install -g wrangler
```

2. **认证和项目设置**
```bash
# 登录 Cloudflare
wrangler auth login

# 创建 D1 数据库
wrangler d1 create malnu-kananga-db

# 为 AI RAG 系统创建 Vectorize 索引
wrangler vectorize create malnu-kananga-index --dimensions=768 --metric=cosine
```

3. **配置 Wrangler**
编辑 `wrangler.toml` 文件:
```toml
name = "malnu-kananga"
main = "worker.js"
compatibility_date = "2024-01-01"

# D1 数据库
[[d1_databases]]
binding = "DB"
database_name = "malnu-kananga-db"
database_id = "your_database_id"

# Vectorize 索引
[[vectorize]]
binding = "VECTORIZE_INDEX"
index_name = "malnu-kananga-index"

# 环境变量
[vars]
API_KEY = "your_gemini_api_key"
NODE_ENV = "production"
```

4. **部署 Worker**
```bash
# 部署到 Cloudflare
wrangler deploy

# 查看日志
wrangler tail
```

5. **种子向量数据库 (一次性)**
```bash
# Worker 部署后，使用内容种子向量数据库
curl https://your-worker.your-subdomain.workers.dev/seed
```

### 前端部署 (Cloudflare Pages)

```bash
# 构建生产包
npm run build

# 通过 Wrangler 部署到 Cloudflare Pages
wrangler pages deploy dist --compatibility-date=2024-01-01
```

## 核心服务与功能

### 1. AI 聊天系统 (RAG)

AI 聊天功能在 `src/services/geminiService.ts` 中实现，使用 Retrieval-Augmented Generation (RAG) 模式:

1. 用户通过 `ChatWindow` 组件发送消息
2. `geminiService` 向 `worker.js` 发送请求获取相关上下文
3. Worker 查询 Cloudflare Vectorize 向量数据库
4. 检索到的上下文与用户消息结合，发送给 Google Gemini API
5. Gemini 生成基于上下文的响应
6. 对话历史存储在浏览器的 `MemoryBank` 系统中

### 2. 身份验证系统

身份验证在 `src/services/authService.ts` 中实现，支持开发和生产环境:

- **开发模式**: 使用本地存储模拟 Magic Link 登录
- **生产模式**: 与 `worker.js` 中实现的 Cloudflare Worker 集成
- 使用 JWT 令牌进行安全会话管理
- 支持自动令牌刷新

### 3. 内存库系统

在 `src/memory/` 目录中实现，用于存储对话历史和其他应用数据:

- 使用 `MemoryBank` 类管理内存
- 支持本地存储和云存储适配器
- 实现相关性搜索以检索上下文信息

## 开发工作流

### 环境变量

开发时需要设置以下环境变量 (在 `.env` 文件中):

- `VITE_API_KEY`: Google Gemini API 密钥
- `VITE_WORKER_URL`: Worker URL (开发时为 http://localhost:8787)
- `VITE_JWT_SECRET`: JWT 签名密钥 (开发用)

### 代码质量

- **TypeScript**: 启用严格模式，禁止使用 `any` 类型
- **ESLint**: 代码 linting
- **Prettier**: 代码格式化
- **测试**: 所有组件和 hooks 都需要测试覆盖

## 关键文件说明

- `src/App.tsx`: 主应用组件，管理路由和全局状态
- `worker.js`: Cloudflare Worker，处理身份验证、RAG 检索和数据种子
- `src/services/geminiService.ts`: AI 聊天服务实现
- `src/services/authService.ts`: 身份验证服务实现
- `src/memory/MemoryBank.ts`: 内存库核心实现
- `src/components/ChatWindow.tsx`: AI 聊天界面
- `src/components/StudentDashboard.tsx`: 学生门户
- `src/components/TeacherDashboard.tsx`: 教师门户
- `src/components/ParentDashboard.tsx`: 家长门户