# 🚀 UniPass 部署检查清单 - Sepolia 测试网

## ✅ 部署前检查

### 1. 配置私钥
- [ ] 打开 `packages/contracts/.env` 文件
- [ ] 将 `PRIVATE_KEY=your_private_key_here` 替换为你的实际私钥（不含 0x）
- [ ] ⚠️ **警告：不要将 .env 文件提交到 Git！**

**如何获取私钥：**
```
MetaMask > 设置 > 安全和隐私 > 显示私钥
```

### 2. 获取 Sepolia 测试币
- [ ] 访问水龙头获取测试币（需要至少 0.1 ETH）
  - 🔗 https://sepoliafaucet.com/
  - 🔗 https://faucets.chain.link/sepolia
  - 🔗 https://www.infura.io/faucet/sepolia

### 3. 验证配置
- [ ] Semaphore 地址: `0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D` ✅
- [ ] ZKPassport 地址: `0x1D000001000EFD9a6371f4d90bB8920D5431c0D8` ✅

---

## 🔨 部署步骤

### 1. 运行部署脚本

```bash
cd packages/contracts
./deploy-sepolia.sh
```

或手动运行：

```bash
cd packages/contracts
source .env
forge script script/Deploy.s.sol:DeployScript \
    --rpc-url $SEPOLIA_RPC_URL \
    --broadcast \
    -vvvv
```

### 2. 记录部署信息

从输出中记录以下信息：

- [ ] **UniPassRegistry 地址**: `0x________________________`
- [ ] **UniPass Group ID**: `_____`

### 3. 在 Etherscan 验证

访问: https://sepolia.etherscan.io/address/你的合约地址

- [ ] 确认合约已部署
- [ ] 查看构造函数参数
- [ ] 验证 Group 创建交易

---

## 🌐 配置前端

### 1. 安装前端依赖

```bash
cd apps/web
pnpm install
```

### 2. 配置环境变量

```bash
cd apps/web

# 创建配置文件
cp env.local.template .env.local

# 编辑 .env.local
```

填入以下内容：

```env
# WalletConnect Project ID (https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=你的项目ID

# UniPass Registry 地址（从部署输出复制）
NEXT_PUBLIC_UNIPASS_REGISTRY_ADDRESS=0x你的合约地址

# Semaphore 地址（官方，无需修改）
NEXT_PUBLIC_SEMAPHORE_ADDRESS=0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D
```

### 3. 启动前端

```bash
cd apps/web
pnpm dev
```

访问: http://localhost:3000

---

## 🧪 测试部署

### 1. 验证合约可读性

```bash
# 读取 Group ID
cast call 0x你的合约地址 \
    "uniPassGroupId()" \
    --rpc-url https://rpc.sepolia.org

# 读取常量
cast call 0x你的合约地址 \
    "ZK_APP_DOMAIN()(string)" \
    --rpc-url https://rpc.sepolia.org
```

### 2. 前端测试

- [ ] 连接钱包成功
- [ ] 生成 QR 码
- [ ] （可选）使用 ZKPassport App 扫描
- [ ] 查看交易历史

---

## 📝 部署信息记录

| 项目 | 值 | 链接 |
|------|-----|------|
| **网络** | Sepolia | |
| **Chain ID** | 11155111 | |
| **UniPassRegistry** | 0x________________________ | [查看](https://sepolia.etherscan.io/address/) |
| **Group ID** | _____ | |
| **部署时间** | ____________ | |
| **部署者地址** | 0x________________________ | |

---

## 🔧 常见问题

### Q: 部署失败 "insufficient funds"
**A:** 确保钱包有足够的 Sepolia ETH（至少 0.1 ETH）

### Q: 部署失败 "nonce too low"
**A:** 等待几秒后重试，或使用 `--slow` 参数

### Q: 找不到 .env 文件
**A:** 确保在 `packages/contracts` 目录下，检查文件是否存在

### Q: 前端无法连接合约
**A:** 确认：
1. `.env.local` 中的地址正确
2. 使用的是 Sepolia 网络
3. 钱包已切换到 Sepolia

---

## 📚 相关链接

- **Sepolia Etherscan**: https://sepolia.etherscan.io
- **Semaphore 文档**: https://docs.semaphore.pse.dev
- **ZKPassport 文档**: https://docs.zkpassport.id
- **WalletConnect**: https://cloud.walletconnect.com

---

**完成部署后，别忘了：**
- ✅ 保存合约地址
- ✅ 在 Etherscan 验证合约
- ✅ 测试前端功能
- ✅ 备份部署信息

