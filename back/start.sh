#!/bin/bash

# 手表数据管理系统 - 启动脚本
# 使用 Node.js 启动 Express 应用

echo "========================================="
echo "手表数据管理系统 - 启动中..."
echo "========================================="

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

# 显示 Node.js 版本
echo "使用的 Node.js 版本:"
node -v
echo ""

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
    echo ""
fi

# 检查 .env 文件是否存在
if [ ! -f ".env" ]; then
    echo "警告: 未找到 .env 文件，请复制 .env.example 并配置"
    echo "执行: cp .env.example .env"
    exit 1
fi

# 启动应用
echo "正在启动 Node.js 服务器..."
npm run dev

