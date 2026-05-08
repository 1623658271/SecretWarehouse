# SecretWarehouse 项目上下文

## 项目概述
- **类型**: Tauri 桌面应用 (v2.x)
- **前端**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand
- **后端**: Rust + SQLite (rusqlite bundled)
- **功能**: 安全密码管理器，支持多用户、加密存储

## 关键技术栈
```
前端: @tauri-apps/api v2, react 18, zustand 4.4, tailwindcss 3.3
后端: tauri 2, rusqlite 0.31, aes-gcm 0.10, pbkdf2 0.12
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
│   ├── capabilities/      # Tauri v2 权限配置
│   └── Cargo.toml
├── .github/workflows/     # CI/CD
└── dist/env/              # Vite 构建输出
```

## 构建配置
- **vite.config.ts**: `outDir: 'dist/env'`
- **tauri.conf.json**: `frontendDist: "../dist/env"`
- **前端构建**: `npm run build` (tsc && vite build)

## CI/CD 状态
- **状态**: 已修复，三平台构建通过
- **Runner**: ubuntu-24.04, windows-latest, macos-14
- **Linux 依赖**: libwebkit2gtk-4.1-dev, libsoup-3.0-dev

## Git 远程仓库
```
github  git@github.com:1623658271/SecretWarehouse.git
gitcode git@gitcode.com:roverfly/SecretWarehouse.git
```

## 常用命令
```bash
# 开发
npm run dev

# 构建
npm run build && npm run tauri build

# 构建脚本
bash build_linux.sh        # Linux
.\build_windows.ps1        # Windows
bash build_mac.sh          # macOS

# 检查
npx tsc --noEmit
cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
```

## Tauri v2 迁移要点
- System Tray 使用 `tauri::menu` 和 `tauri::tray`
- 全局快捷键使用 `tauri-plugin-global-shortcut`
- 窗口 API: `WebviewWindowBuilder` 替代 `WindowBuilder`
- 前端导入: `@tauri-apps/api/core` 替代 `@tauri-apps/api/tauri`
- 权限配置: `capabilities/default.json` 替代 `allowlist`
