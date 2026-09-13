pragma solidity ^0.8.26;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

library SafeERC20 {
    error TransferFailed();

    function pull(IERC20 token, address from, address to, uint256 amount) internal {
        if (amount == 0) return;
        bool ok = token.transferFrom(from, to, amount);
        if (!ok) revert TransferFailed();
    }

    function push(IERC20 token, address to, uint256 amount) internal {
        if (amount == 0) return;
        bool ok = token.transfer(to, amount);
        if (!ok) revert TransferFailed();
    }
}
