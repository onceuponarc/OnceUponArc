pragma solidity ^0.8.26;

import {IERC20} from "./IERC20.sol";

/// @notice Story mint. Minted once into the base vault. Mint authority burned at graduate.
contract StoryToken is IERC20 {
    string public name;
    string public symbol;
    uint8 public immutable decimals;
    uint256 public totalSupply;
    address public mintAuthority;
    string public uri;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    error NotMinter();
    error Frozen();

    constructor(string memory name_, string memory symbol_, uint8 decimals_, string memory uri_, address minter) {
        name = name_;
        symbol = symbol_;
        decimals = decimals_;
        uri = uri_;
        mintAuthority = minter;
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != mintAuthority) revert NotMinter();
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function transferMinter(address next) external {
        if (msg.sender != mintAuthority) revert NotMinter();
        mintAuthority = next;
    }

    function renounceMintAuthority() external {
        if (msg.sender != mintAuthority) revert NotMinter();
        mintAuthority = address(0);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _move(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - amount;
        }
        _move(from, to, amount);
        return true;
    }

    function _move(address from, address to, uint256 amount) internal {
        uint256 bal = balanceOf[from];
        require(bal >= amount, "balance");
        unchecked {
            balanceOf[from] = bal - amount;
            balanceOf[to] += amount;
        }
        emit Transfer(from, to, amount);
    }
}
