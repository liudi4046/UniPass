#!/bin/bash

echo "========================================"
echo "  UniPass 部署到 Sepolia 测试网"
echo "========================================"
echo ""

# 检查 .env 配置
if grep -q "your_private_key_here" .env; then
    echo "❌ 错误：请先在 .env 文件中配置你的私钥！"
    echo ""
    echo "编辑文件: packages/contracts/.env"
    echo "将 PRIVATE_KEY=your_private_key_here"
    echo "替换为你的实际私钥"
    exit 1
fi

echo "✅ 配置检查通过"
echo ""
echo "使用的合约地址："
echo "  - Semaphore V4: 0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D"
echo "  - ZKPassport Verifier: 0x1D000001000EFD9a6371f4d90bB8920D5431c0D8"
echo ""
echo "开始部署..."
echo ""

# 加载环境变量
source .env

# 部署
forge script script/Deploy.s.sol:DeployScript \
    --rpc-url $SEPOLIA_RPC_URL \
    --broadcast \
    -vvvv

echo ""
echo "========================================"
echo "  部署完成！"
echo "========================================"
echo ""
echo "请记录以下信息："
echo "1. UniPassRegistry 合约地址"
echo "2. UniPass Group ID"
echo ""
echo "将合约地址填入前端配置："
echo "apps/web/.env.local"
