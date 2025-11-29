# UniPass 合约

该 Hardhat 项目实现了 `UniPassRegistry`，负责：

- 通过 `IZKPassportValidator` 接口接入护照零知识证明；
- 将身份承诺写入由 Semaphore 管理的全局匿名池；
- 为 DApp 提供 `validateUniPassProof` / `verifyUniPassProof` 等快捷方法；
- 暴露当前 Merkle Root、成员数量等状态数据。

## 快速开始

```bash
cd unipass-core/contracts
npm install
npm test
```

## 主要合约

| 合约 | 作用 |
| --- | --- |
| `UniPassRegistry` | 生产合约，连接 ZKPassport 与 Semaphore。 |
| `MockPassportValidator` | 测试辅助，返回布尔值控制是否允许注册。 |
| `MockSemaphore` | 轻量级 Semaphore stub，用于 Hardhat 单元测试。 |

## 部署脚本

```bash
SEMAPHORE_ADDRESS=0x... \
PASSPORT_VALIDATOR_ADDRESS=0x... \
MERKLE_TREE_DURATION=86400 \
npx hardhat run scripts/deploy.ts --network <network>
```

部署完成后脚本会输出注册表地址以及分配到的 `groupId`，DApp 需要记录该值以生成正确的零知识证明。

## 常见拓展点

- `IZKPassportValidator` 仅返回布尔值，可根据实际电路扩展为回传 `nullifier` 或其他审计数据。
- 若需要多组真人池，可扩展合约，在构造函数之外创建更多 group 并暴露切换接口。
- 通过 `updatePassportValidator` 与 `updateMerkleTreeDuration` 可在不迁移用户的情况下完成治理升级。

