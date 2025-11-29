<p align="center">
  <img src="https://raw.githubusercontent.com/semaphore-protocol/website/main/static/img/logo.svg" alt="UniPass" width="120" />
</p>

# UniPass Core

UniPass 是一个围绕 “一次护照验证，永久匿名身份” 的去中心化身份层。为了便于在本仓库中与已有的 `semaphore` 与 `zkpassport-docs` 项目解耦，我们在 `unipass-core/` 中搭建了独立的实现目录，用来承载智能合约、SDK 以及白皮书级文档。

## 目录结构

| 路径 | 说明 |
| --- | --- |
| `docs/` | 白皮书草案、路演提纲以及面向非技术读者的材料。 |
| `contracts/` | Hardhat 项目，包含 UniPass Registry 合约、Mock 合约与测试。 |
| `sdk/` | TypeScript SDK 草案，封装客户端生成身份承诺与调用流程。 |
| `web/` | Next.js 15 前端 Demo，提供一次性注册与 Proof 提交流程。 |

## 快速开始

1. **安装依赖**

   ```bash
   cd unipass-core/contracts
   npm install
   ```

2. **运行测试**

   ```bash
   npm test
   ```

3. **阅读白皮书**

   ```bash
   open docs/whitepaper.md
   ```

## 技术栈

- 零知识证明与匿名身份：`@semaphore-protocol/contracts`
- 智能合约框架：Hardhat + TypeScript
- SDK：Vite + TypeScript（未来可扩展至 RN / 浏览器环境）
- 前端：Next.js 15 + React 19 + Tailwind CSS

## 后续工作

- [ ] 对接真实的 ZKPassport 验证器（目前使用接口 & Mock）
- [ ] 在 SDK 中集成手机 NFC 护照读取流程
- [ ] 提供示例 DApp（如空投领取或 Snapshot 投票插件）

欢迎基于该目录继续扩展，所有实现均与文档目录相互独立，便于协同开发。


