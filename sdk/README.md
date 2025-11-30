# UniPass SDK

`@unipass/sdk` 提供了与 UniPass 协议交互所需的客户端工具，包括身份管理、零知识证明生成辅助以及与注册表合约的通信封装。

## 安装

```bash
cd unipass-core/sdk
npm install
npm run build
```

## 核心模块

### 1. Identity (`src/identity.ts`)

基于 `@semaphore-protocol/identity`，用于管理本地的隐私身份。

```typescript
import { deriveIdentity } from "@unipass/sdk";

// 从随机种子或签名中派生身份
const identity = deriveIdentity("signature-message-or-random-seed");

console.log(identity.commitment); // 公开的身份承诺，用于注册
console.log(identity.privateKey); // 私钥，需在本地安全存储
```

### 2. Client (`src/client.ts`)

封装了 `UniPassRegistry` 合约的交互逻辑。

```typescript
import { UniPassClient } from "@unipass/sdk";
import { JsonRpcProvider } from "ethers";

const provider = new JsonRpcProvider("...");
const client = new UniPassClient({ contractAddress: "0x...", chainId: 31337 }, provider);

// 查询用户是否已注册
const isMember = await client.isRegistered(identity.commitment);

// 注册新用户 (通常在服务端或 Relayer 中调用)
await client.register({
  identity,
  proof: { proof: "zk-passport-proof-json" }
});
```

### 3. Types (`src/types.ts`)

包含所有核心接口定义，如 `IdentityArtifacts`, `PassportProofPayload`, `UniPassConfig` 等。

## 构建与发布

目前该 SDK 设计为 Monorepo 内部引用。若需发布到 NPM：

1. 修改 `package.json` 中的 `name` 与 `version`。
2. 运行 `npm publish --access public`。

