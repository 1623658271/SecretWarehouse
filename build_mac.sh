#!/bin/bash
set -e

echo "=========================================="
echo "  SecretWarehouse - macOS 构建脚本"
echo "=========================================="

# 项目根目录
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="$PROJECT_DIR/mac_dist"

# 清理旧的 dist 目录
echo ""
echo "[1/4] 清理旧的构建产物..."
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# 构建前端
echo ""
echo "[2/4] 构建前端资源..."
cd "$PROJECT_DIR"
npm run build

# 构建 Tauri 应用
echo ""
echo "[3/4] 构建 macOS 应用..."
cd "$PROJECT_DIR/src-tauri"
cargo build --release

# 复制构建产物
echo ""
echo "[4/4] 复制构建产物到 $DIST_DIR..."

# 复制可执行文件
if [ -f "$PROJECT_DIR/src-tauri/target/release/secret-warehouse" ]; then
    cp "$PROJECT_DIR/src-tauri/target/release/secret-warehouse" "$DIST_DIR/"
    chmod +x "$DIST_DIR/secret-warehouse"
    echo "  ✓ 可执行文件: secret-warehouse"
fi

# 复制 bundle 包
BUNDLE_DIR="$PROJECT_DIR/src-tauri/target/release/bundle"
if [ -d "$BUNDLE_DIR" ]; then
    # DMG 镜像
    if [ -d "$BUNDLE_DIR/dmg" ]; then
        cp -r "$BUNDLE_DIR/dmg" "$DIST_DIR/"
        echo "  ✓ DMG 镜像: mac_dist/dmg/"
    fi

    # macOS 应用包
    if [ -d "$BUNDLE_DIR/macos" ]; then
        cp -r "$BUNDLE_DIR/macos" "$DIST_DIR/"
        echo "  ✓ 应用包: mac_dist/macos/"
    fi
fi

# 复制配置文件
cp "$PROJECT_DIR/src-tauri/tauri.conf.json" "$DIST_DIR/" 2>/dev/null || true

echo ""
echo "=========================================="
echo "  macOS 构建完成!"
echo "  输出目录: $DIST_DIR"
echo "=========================================="
ls -la "$DIST_DIR"
