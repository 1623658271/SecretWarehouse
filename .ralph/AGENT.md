# Agent 构建指令

## 项目构建命令

### 初始化项目
```bash
# 创建 Tauri 项目（如果还未创建）
npm create tauri-app@latest . --template react-ts

# 安装前端依赖
npm install

# 安装额外前端依赖
npm install zustand lucide-react @tauri-apps/api
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Rust 依赖在 src-tauri/Cargo.toml 中配置
```

### 开发模式运行
```bash
npm run tauri dev
```

### 构建
```bash
npm run tauri build
```

### Rust 编译检查
```bash
cd src-tauri && cargo check
```

### 前端类型检查
```bash
npx tsc --noEmit
```

## 文件结构约定

- Rust 源码: `src-tauri/src/`
- React 源码: `src/`
- 组件: `src/components/`
- 页面: `src/pages/`
- 状态: `src/stores/`
- 类型定义: `src/types/`
- 工具函数: `src/lib/`

## 代码规范

- Rust: 使用 `cargo fmt` 格式化，`cargo clippy` 检查
- TypeScript: 严格模式，使用 ESLint
- 组件使用函数式 + Hooks
- 所有敏感数据通过 Tauri invoke 与后端交互，前端不直接操作数据库
