pragma solidity ^0.8.26;

import {IERC20, SafeERC20} from "./IERC20.sol";

/// @notice Same-tx author push. On revert, quote is rescued to `fallbackTo` (piece vault or protocol).
library AuthorFeeHook {
    function pushOrRescue(IERC20 token, address recipient, address fallbackTo, uint256 amount) internal {
        if (amount == 0 || recipient == address(0)) return;
        (bool ok, bytes memory data) =
            address(token).call(abi.encodeWithSelector(IERC20.transfer.selector, recipient, amount));
        bool success = ok && (data.length == 0 || abi.decode(data, (bool)));
        if (success) return;
        if (fallbackTo != address(0)) {
            SafeERC20.push(token, fallbackTo, amount);
        }
    }
}
