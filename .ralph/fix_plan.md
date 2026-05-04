# SecretWarehouse - 任务计划

## 优先级说明
- **P0**: 必须完成，阻塞其他任务
- **P1**: 核心功能，高优先级
- **P2**: 重要功能
- **P3**: 增强功能

## 任务列表

### 阶段一：项目初始化 (P0)
- [x] 1.1 初始化 Tauri + React + TypeScript 项目
- [x] 1.2 配置 Cargo.toml 依赖 (rusqlite, aes-gcm, argon2, serde, uuid, chrono)
- [x] 1.3 配置前端依赖 (tailwindcss, zustand, lucide-react, @tauri-apps/api)
- [x] 1.4 配置 Tailwind CSS + shadcn/ui

### 阶段二：Rust 后端核心 (P0)
- [x] 2.1 实现数据模型 (models.rs) — SecretEntry, SecretType 枚举
- [x] 2.2 实现加密模块 (crypto.rs) — AES-256-GCM 加解密、Argon2id 密钥派生
- [x] 2.3 实现数据库模块 (db.rs) — SQLite 初始化、CRUD 操作、FTS5 索引
- [x] 2.4 实现搜索模块 (search.rs) — FTS5 全文搜索查询
- [x] 2.5 实现 Tauri 命令 (commands.rs) — 前端可调用的 API 接口

### 阶段三：前端基础 (P1)
- [x] 3.1 搭建应用框架 — App.tsx 路由布局
- [x] 3.2 实现侧边栏组件 (Sidebar.tsx) — 分类导航
- [x] 3.3 实现搜索栏组件 (SearchBar.tsx) — 实时搜索
- [x] 3.4 实现全局状态管理 (useStore.ts)

### 阶段四：核心 UI (P1)
- [x] 4.1 实现秘密条目列表 (SecretList.tsx)
- [x] 4.2 实现条目详情展示 (SecretDetail.tsx) — 显示/隐藏密码
- [x] 4.3 实现新增/编辑表单 (SecretForm.tsx)
- [x] 4.4 实现删除确认对话框

### 阶段五：功能增强 (P2)
- [x] 5.1 实现密码生成器
- [x] 5.2 实现一键复制到剪贴板 + 自动清除
- [ ] 5.3 实现密码强度指示器
- [ ] 5.4 实现导入/导出功能 (加密 JSON)

### 阶段六：UI 打磨 (P2)
- [ ] 6.1 实现暗色/亮色主题切换
- [x] 6.2 实现条目类型图标
- [ ] 6.3 动画和过渡效果
- [ ] 6.4 响应式布局优化

### 阶段七：安全与测试 (P3)
- [ ] 7.1 实现主密码认证流程（可跳过模式）
- [ ] 7.2 实现自动锁定功能
- [ ] 7.3 端到端测试
- [ ] 7.4 安全审计和修复
