# UniPass 部署指南 - Sepolia 测试网

## 📋 部署前准备

### 1. 获取 Sepolia 测试币

访问以下任一水龙头获取免费的 Sepolia ETH：

- **Alchemy Faucet**: https://sepoliafaucet.com/
- **Infura Faucet**: https://www.infura.io/faucet/sepolia
- **QuickNode Faucet**: https://faucet.quicknode.com/ethereum/sepolia
- **Chainlink Faucet**: https://faucets.chain.link/sepolia

> 💡 建议准备 **0.5-1 ETH** 用于部署和测试

### 2. 获取 RPC URL（可选）

免费选项：
- **Alchemy**: https://www.alchemy.com/ (免费 3亿 compute units/月)
- **Infura**: https://www.infura.io/ (免费 10万请求/天)
- **公共 RPC**: `https://rpc.sepolia.org` (不稳定，不推荐生产)

### 3. 配置私钥

```bash
cd packages/contracts

# 从 MetaMask 导出私钥
# 设置 > 账户详情 > 导出私钥

# 编辑 .env 文件
nano .env
# 填入：PRIVATE_KEY=你的私钥（不含0x前缀）
```

## 🚀 部署步骤

### 方案 A: 使用 Mock 合约（快速测试）

如果 Semaphore 和 ZKPassport 官方尚未在 Sepolia 部署，可以先部署 Mock 版本：

```bash
cd packages/contracts

# 1. 部署 Mock 合约（包含 Semaphore 和 ZKPassport Mock）
forge script script/Deploy.s.sol:DeployMockScript \
    --rpc-url $SEPOLIA_RPC_URL \
    --broadcast \
    --verify \
    -vvvv

# 2. 记录输出的合约地址
# MockSemaphore: 0x...
# MockZKPassportVerifier: 0x...
# UniPassRegistry: 0x...
```

### 方案 B: 使用官方合约（生产环境）

查找官方合约地址：

1. **Semaphore V4**
   - 文档: https://docs.semaphore.pse.dev/deployed-contracts
   - GitHub: https://github.com/semaphore-protocol/semaphore

2. **ZKPassport Verifier**
   - 文档: https://docs.zkpassport.id
   - GitHub: https://github.com/zkpassport

配置并部署：

```bash
# 1. 更新 .env 文件
SEMAPHORE_ADDRESS=0x官方地址
ZKPASSPORT_VERIFIER_ADDRESS=0x官方地址

# 2. 部署 UniPassRegistry
forge script script/Deploy.s.sol:DeployScript \
    --rpc-url $SEPOLIA_RPC_URL \
    --broadcast \
    --verify \
    -vvvv
```

## 📝 部署后配置

### 1. 更新合约环境变量

```bash
# 在 packages/contracts/.env 中更新
UNIPASS_REGISTRY_ADDRESS=0x部署的地址
```

### 2. 配置前端

```bash
cd apps/web

# 创建配置文件
cp env.example .env.local

# 编辑 .env.local
nano .env.local
```

填入以下内容：

```env
# WalletConnect Project ID (https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=你的项目ID

# 合约地址（从部署输出复制）
NEXT_PUBLIC_UNIPASS_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_SEMAPHORE_ADDRESS=0x...
```

### 3. 启动前端

```bash
cd apps/web
pnpm install
pnpm dev
```

访问: http://localhost:3000

## ✅ 验证部署

### 1. 在 Sepolia Etherscan 查看合约

```
https://sepolia.etherscan.io/address/你的合约地址
```

### 2. 验证合约代码（如果自动验证失败）

```bash
forge verify-contract \
    --chain-id 11155111 \
    --num-of-optimizations 200 \
    --compiler-version v0.8.23 \
    0x合约地址 \
    src/UniPassRegistry.sol:UniPassRegistry \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --constructor-args $(cast abi-encode "constructor(address,address)" 0xSemaphore地址 0xVerifier地址)
```

### 3. 测试合约功能

```bash
# 读取合约信息
cast call 0x合约地址 "uniPassGroupId()" --rpc-url $SEPOLIA_RPC_URL
cast call 0x合约地址 "ZK_APP_DOMAIN()(string)" --rpc-url $SEPOLIA_RPC_URL
```

## 🔍 常见问题

### Q: 部署失败 "insufficient funds"
A: 确保你的钱包有足够的 Sepolia ETH，至少 0.1 ETH

### Q: RPC 请求失败
A: 检查 RPC URL 是否正确，或尝试更换 RPC 提供商

### Q: 合约验证失败
A: 确保 Etherscan API key 正确，或稍后手动验证

### Q: 找不到官方 Semaphore/ZKPassport 地址
A: 先使用 Mock 合约部署测试，等官方部署后再迁移

## 🌐 测试网信息

- **网络名称**: Sepolia
- **Chain ID**: 11155111
- **RPC URL**: https://rpc.sepolia.org
- **区块浏览器**: https://sepolia.etherscan.io
- **符号**: SepoliaETH

## 📞 获取帮助

- UniPass GitHub: https://github.com/your-repo
- Semaphore Discord: https://discord.gg/semaphore
- ZKPassport Docs: https://docs.zkpassport.id

