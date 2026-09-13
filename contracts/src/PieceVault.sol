pragma solidity ^0.8.26;

import {IERC20, SafeERC20} from "./IERC20.sol";
import {IStoryEvents} from "./IStoryEvents.sol";

/// @notice Ownerless fee sink. Claims are proportional to circulating Story holdings.
contract PieceVault is IStoryEvents {
    using SafeERC20 for IERC20;

    IERC20 public immutable storyToken;
    address public immutable baseVault;
    address public immutable author;

    mapping(address => uint256) public accrued;
    mapping(address => mapping(address => uint256)) public claimed;

    constructor(IERC20 storyToken_, address baseVault_, address author_) {
        storyToken = storyToken_;
        baseVault = baseVault_;
        author = author_;
    }

    function accrue(address asset, uint256 amount) external {
        require(msg.sender == baseVault, "curve");
        if (amount == 0) return;
        accrued[asset] += amount;
        emit PieceAccrued(bytes32(uint256(uint160(address(storyToken)))), asset, amount);
    }

    function claim(address asset, address user) external returns (uint256 share) {
        uint256 pool = accrued[asset];
        if (pool == 0) return 0;
        uint256 supply = storyToken.totalSupply();
        uint256 inVault = storyToken.balanceOf(baseVault);
        uint256 circulating = supply > inVault ? supply - inVault : 0;
        uint256 held = storyToken.balanceOf(user);
        if (circulating == 0 || held == 0) return 0;
        uint256 entitled = (pool * held) / circulating;
        uint256 already = claimed[asset][user];
        if (entitled <= already) return 0;
        share = entitled - already;
        uint256 available = IERC20(asset).balanceOf(address(this));
        if (share > available) share = available;
        claimed[asset][user] += share;
        SafeERC20.push(IERC20(asset), user, share);
        emit PieceClaimed(bytes32(uint256(uint160(address(storyToken)))), user, asset, share);
    }
}
