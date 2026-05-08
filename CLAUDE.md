# SecretWarehouse 项目上下文

## 项目概述
- **类型**: Tauri 桌面应用 (v1.x)
- **前端**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand
- **后端**: Rust + SQLite (rusqlite bundled)
- **功能**: 安全密码管理器，支持多用户、加密存储

## 关键技术栈
```
前端: @tauri-apps/api v1.5, react 18, zustand 4.4, tailwindcss 3.3
后端: tauri 1, rusqlite 0.31, aes-gcm 0.10, pbkdf2 0.12
```

## 项目结构
```
SecretWarehouse/
├── src/                    # React 前端
│   ├── components/         # UI 组件
│   ├── stores/            # Zustand 状态管理
│   └── types/             # TypeScript 类型
├── src-tauri/             # Rust 后端
│   ├── src/
│   │   ├── commands.rs    # Tauri 命令
│   │   ├── crypto.rs      # 加密模块
│   │   ├── db.rs          # 数据库操作
│   │   └── main.rs        # 入口
│   └── Cargo.toml
├── .github/workflows/     # CI/CD
└── dist/env/              # Vite 构建输出
```

## 构建配置
- **vite.config.ts**: `outDir: 'dist/env'`
- **tauri.conf.json**: `distDir: "../dist/env"`
- **前端构建**: `npm run build` (tsc && vite build)

## CI/CD 状态
- **当前问题**: ubuntu-latest 已升级到 24.04，不兼容 webkit2gtk-4.0
- **待修复**: 将 runner 改为 ubuntu-22.04 或升级依赖到 4.1 版本
- **Linux 依赖 (22.04)**: libwebkit2gtk-4.0-dev, libsoup2.4-dev
- **Linux 依赖 (24.04)**: libwebkit2gtk-4.1-dev, libsoup-3.0-dev

## Git 远程仓库
```
github  git@github.com:1623658271/SecretWarehouse.git
gitcode git@gitcode.com:roverfly/SecretWarehouse.git
```

## 待办事项
- [ ] 适配 Ubuntu 24.04 (更新依赖版本)
- [ ] 修复 CI/CD workflow 构建失败

## 常用命令
```bash
# 开发
npm run dev

# 构建
npm run build && npm run tauri build

# 检查
npx tsc --noEmit
cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
```
