pragma solidity ^0.8.26;

import {IERC20, SafeERC20} from "./IERC20.sol";

/// @notice Minimal x·y=k pair. Seeded at graduation; LP burned to 0xdead.
contract GraduateAMM {
    using SafeERC20 for IERC20;

    address public constant DEAD = 0x000000000000000000000000000000000000dEaD;
    uint256 public constant FEE_BPS = 30; // 0.30% LP fee after graduation

    IERC20 public token0;
    IERC20 public token1;
    uint256 public reserve0;
    uint256 public reserve1;
    bool public seeded;
    address public lpHolder;
    address public immutable opener;

    error AlreadySeeded();
    error NotSeeded();
    error BadAmount();
    error NotOpener();

    constructor() {
        opener = msg.sender;
    }

    event Seeded(address indexed token0, address indexed token1, uint256 reserve0, uint256 reserve1);
    event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out);

    function seed(IERC20 base, IERC20 quote, uint256 baseAmount, uint256 quoteAmount) external {
        if (msg.sender != opener) revert NotOpener();
        if (seeded) revert AlreadySeeded();
        if (baseAmount == 0 || quoteAmount == 0) revert BadAmount();
        token0 = base;
        token1 = quote;
        SafeERC20.pull(base, msg.sender, address(this), baseAmount);
        SafeERC20.pull(quote, msg.sender, address(this), quoteAmount);
        reserve0 = base.balanceOf(address(this));
        reserve1 = quote.balanceOf(address(this));
        lpHolder = DEAD;
        seeded = true;
        emit Seeded(address(base), address(quote), reserve0, reserve1);
    }

    function getReserves() external view returns (uint256, uint256) {
        return (reserve0, reserve1);
    }

    function priceX18() external view returns (uint256) {
        if (reserve0 == 0) return 0;
        return (reserve1 * 1e18) / reserve0;
    }

    function swap(uint256 amount0Out, uint256 amount1Out, address to) external {
        if (!seeded) revert NotSeeded();
        if (amount0Out == 0 && amount1Out == 0) revert BadAmount();
        if (amount0Out >= reserve0 || amount1Out >= reserve1) revert BadAmount();

        if (amount0Out > 0) SafeERC20.push(token0, to, amount0Out);
        if (amount1Out > 0) SafeERC20.push(token1, to, amount1Out);

        uint256 bal0 = token0.balanceOf(address(this));
        uint256 bal1 = token1.balanceOf(address(this));
        uint256 amount0In = bal0 > reserve0 - amount0Out ? bal0 - (reserve0 - amount0Out) : 0;
        uint256 amount1In = bal1 > reserve1 - amount1Out ? bal1 - (reserve1 - amount1Out) : 0;
        if (amount0In == 0 && amount1In == 0) revert BadAmount();

        uint256 bal0Adj = (bal0 * 10_000) - (amount0In * FEE_BPS);
        uint256 bal1Adj = (bal1 * 10_000) - (amount1In * FEE_BPS);
        require(bal0Adj * bal1Adj >= reserve0 * reserve1 * 10_000 * 10_000, "k");

        reserve0 = bal0;
        reserve1 = bal1;
        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out);
    }
}
