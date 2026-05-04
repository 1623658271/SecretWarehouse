# SecretWarehouse - 项目开发指令

## 项目概述

SecretWarehouse 是一个本地运行的秘密信息管理仓库，使用 Rust + Tauri 构建，用于安全存储各类敏感信息。

## 核心目标

1. 使用 Tauri + React + TypeScript 构建桌面应用
2. 使用 AES-256-GCM 加密所有存储数据
3. 使用 SQLite (rusqlite) 作为存储后端，支持 FTS5 全文搜索
4. 使用 Tailwind CSS + shadcn/ui 构建美观的 UI 界面
5. 测试完毕前不需要启动时输入主密码（开发模式跳过认证）

## 技术栈

- **后端**: Rust + Tauri
- **前端**: React 18 + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand
- **图标**: lucide-react
- **数据库**: SQLite (rusqlite) with FTS5
- **加密**: AES-256-GCM (aes-gcm crate)
- **密钥派生**: Argon2id (argon2 crate)

## 秘密条目类型

支持以下 6 种类型：
1. **网站账号** — URL、用户名、密码
2. **API Key** — 服务名、密钥、备注
3. **银行卡** — 银行名、卡号、持卡人、有效期、CVV
4. **安全笔记** — 标题、加密内容
5. **SSH 密钥** — 标题、私钥/公钥、备注
6. **软件许可证** — 软件名、许可证密钥、邮箱、备注

## 开发原则

- 每完成一个功能模块立即 commit，commit 信息用中文
- 加密是第一优先级，所有敏感字段必须加密存储
- UI 必须美观，使用暗色主题作为默认
- 前端调用 Rust 后端一律通过 Tauri invoke 命令
- 每个 Tauri 命令都要有完善的错误处理
- 测试阶段使用硬编码的开发密钥，跳过主密码验证
