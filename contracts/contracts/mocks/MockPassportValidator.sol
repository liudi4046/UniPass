// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IZKPassportValidator} from "../interfaces/IZKPassportValidator.sol";

/// @dev 仅用于本地测试的模拟验证器。
contract MockPassportValidator is IZKPassportValidator {
    bool public shouldValidate;

    constructor(bool initialState) {
        shouldValidate = initialState;
    }

    function setValidationResult(bool newResult) external {
        shouldValidate = newResult;
    }

    function validatePassport(
        bytes calldata,
        address,
        uint256
    ) external view override returns (bool) {
        return shouldValidate;
    }
}

