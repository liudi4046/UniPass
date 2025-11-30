# UniPass Web Demo

该目录包含一个 Next.js 15 前端应用，展示了 UniPass 的核心用户流程：连接钱包、扫描护照（模拟）、生成匿名身份并提交到链上注册表。

## 快速开始

1. **安装依赖**

   ```bash
   cd unipass-core/web
   npm install
   ```

2. **配置环境变量**

   复制示例配置并按需修改：

   ```bash
   cp .env.example .env.local
   ```

   **环境变量说明：**

   | 变量名 | 说明 | 默认值 / 示例 |
   | --- | --- | --- |
   | `NEXT_PUBLIC_UNIPASS_CONTRACT` | 部署好的 `UniPassRegistry` 合约地址 | `0x...` |
   | `NEXT_PUBLIC_CHAIN_ID` | 目标链 ID | `31337` (Hardhat) |
   | `UNIPASS_RPC_URL` | 后端用于发送注册交易的 RPC 节点 | `http://127.0.0.1:8545` |
   | `UNIPASS_RELAYER_KEY` | Relayer 私钥，用于代付 Gas 提交 Proof | `0x...` |

   > **注意：** 如果未配置 `UNIPASS_RPC_URL` 或 `UNIPASS_RELAYER_KEY`，后端 API 将进入 **Mock 模式**，直接返回成功而不进行链上交互，方便演示 UI 流程。

3. **启动开发服务器**

   ```bash
   npm run dev
   ```

   访问 `http://localhost:3000` 查看 Demo。

## 功能特性

- **无感注册**：通过 API Route (`/api/register`) 代理链上交互，用户无需持有原生代币 (ETH/MATIC) 即可注册。
- **隐私保护**：前端仅生成身份承诺 (Commitment) 与零知识证明，护照敏感信息永不离开浏览器/本地环境。
- **SDK 集成**：直接复用 `../sdk` 中的逻辑，确保前后端算法一致。

## 开发说明

- 页面逻辑位于 `src/app/`，采用 Next.js App Router。
- 注册核心组件：`src/components/registration/RegistrationFlow.tsx`。
- 后端处理逻辑：`src/app/api/register/route.ts`。

