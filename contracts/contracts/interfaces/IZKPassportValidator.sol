// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @title Interface for the off-chain ZK passport validator adapter.
/// @dev UniPass 仅依赖返回布尔值的通用接口，方便未来替换为不同的证明系统。
interface IZKPassportValidator {
    /// @notice 验证护照相关的零知识证明。
    /// @param passportProof 客户端生成的证明（格式由验证器自行决定）。
    /// @param signaler 触发注册的用户地址，可用于设备绑定或速率限制。
    /// @param identityCommitment 即将写入匿名池的承诺。
    /// @return 是否通过验证。
    function validatePassport(
        bytes calldata passportProof,
        address signaler,
        uint256 identityCommitment
    ) external view returns (bool);
}

