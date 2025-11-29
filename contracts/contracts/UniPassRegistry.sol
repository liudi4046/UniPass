// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ISemaphore} from "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";
import {ISemaphoreGroups} from "@semaphore-protocol/contracts/interfaces/ISemaphoreGroups.sol";

import {IZKPassportValidator} from "./interfaces/IZKPassportValidator.sol";

/// @title UniPassRegistry
/// @notice 维护基于护照验证的全局匿名身份池，并为 DApp 提供统一的 Proof-of-Personhood 接口。
contract UniPassRegistry is Ownable {
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error UniPass__ZeroAddress();
    error UniPass__IdentityAlreadyRegistered();
    error UniPass__InvalidPassportProof();
    error UniPass__InvalidIdentityCommitment();

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event IdentityRegistered(
        uint256 indexed identityCommitment,
        uint256 indexed merkleRoot,
        address indexed caller
    );
    event PassportValidatorUpdated(address indexed previousValidator, address indexed newValidator);

    /*//////////////////////////////////////////////////////////////
                               STORAGE
    //////////////////////////////////////////////////////////////*/

    ISemaphore public immutable semaphore;
    ISemaphoreGroups public immutable semaphoreGroups;
    IZKPassportValidator public passportValidator;
    uint256 public immutable groupId;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        address _semaphoreAddress,
        address _passportValidatorAddress,
        uint256 _merkleTreeDuration
    ) Ownable(msg.sender) {
        if (_semaphoreAddress == address(0) || _passportValidatorAddress == address(0)) {
            revert UniPass__ZeroAddress();
        }

        semaphore = ISemaphore(_semaphoreAddress);
        semaphoreGroups = ISemaphoreGroups(_semaphoreAddress);
        passportValidator = IZKPassportValidator(_passportValidatorAddress);

        uint256 createdGroupId = semaphore.createGroup(address(this), _merkleTreeDuration);

        groupId = createdGroupId;
    }

    /*//////////////////////////////////////////////////////////////
                            EXTERNAL LOGIC
    //////////////////////////////////////////////////////////////*/

    /// @notice 注册新的身份承诺，前提是护照证明通过验证。
    /// @param identityCommitment Poseidon Hash 结果，代表匿名真人身份。
    /// @param passportProof 护照 NFC/零知识证明。
    /// @return newMerkleRoot 新的匿名池根。
    function registerIdentity(
        uint256 identityCommitment,
        bytes calldata passportProof
    ) external returns (uint256 newMerkleRoot) {
        if (identityCommitment == 0) {
            revert UniPass__InvalidIdentityCommitment();
        }

        if (semaphoreGroups.hasMember(groupId, identityCommitment)) {
            revert UniPass__IdentityAlreadyRegistered();
        }

        if (!passportValidator.validatePassport(passportProof, msg.sender, identityCommitment)) {
            revert UniPass__InvalidPassportProof();
        }

        semaphore.addMember(groupId, identityCommitment);

        newMerkleRoot = semaphoreGroups.getMerkleTreeRoot(groupId);

        emit IdentityRegistered(identityCommitment, newMerkleRoot, msg.sender);
    }

    /// @notice 允许 DApp 在 UniPass 全局组内直接消费零知识证明。
    function validateUniPassProof(ISemaphore.SemaphoreProof calldata proof) external {
        semaphore.validateProof(groupId, proof);
    }

    /// @notice 纯查询，用于在链下预验证。
    function verifyUniPassProof(ISemaphore.SemaphoreProof calldata proof) external view returns (bool) {
        return semaphore.verifyProof(groupId, proof);
    }

    /// @notice 调整底层 Merkle 树根有效期。
    function updateMerkleTreeDuration(uint256 newDuration) external onlyOwner {
        semaphore.updateGroupMerkleTreeDuration(groupId, newDuration);
    }

    /// @notice 更新护照验证器地址，便于替换不同的证明系统。
    function updatePassportValidator(address newValidator) external onlyOwner {
        if (newValidator == address(0)) {
            revert UniPass__ZeroAddress();
        }

        address previousValidator = address(passportValidator);
        passportValidator = IZKPassportValidator(newValidator);

        emit PassportValidatorUpdated(previousValidator, newValidator);
    }

    /*//////////////////////////////////////////////////////////////
                                VIEWS
    //////////////////////////////////////////////////////////////*/

    function currentMerkleRoot() external view returns (uint256) {
        return semaphoreGroups.getMerkleTreeRoot(groupId);
    }

    function merkleTreeDepth() external view returns (uint256) {
        return semaphoreGroups.getMerkleTreeDepth(groupId);
    }

    function memberCount() external view returns (uint256) {
        return semaphoreGroups.getMerkleTreeSize(groupId);
    }

    function isRegistered(uint256 identityCommitment) external view returns (bool) {
        return semaphoreGroups.hasMember(groupId, identityCommitment);
    }

    function semaphoreAddress() external view returns (address) {
        return address(semaphore);
    }

    function passportValidatorAddress() external view returns (address) {
        return address(passportValidator);
    }
}

