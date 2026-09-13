pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {ChapterFactory} from "../src/ChapterFactory.sol";

/// @notice Chapter Factory on public Arc Testnet. Quote is native Circle USDC.
contract DeployTestnet is Script {
    address constant USDC = 0x3600000000000000000000000000000000000000;

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        vm.startBroadcast(pk);
        ChapterFactory factory = new ChapterFactory(deployer, deployer);
        factory.setQuote(USDC, true);
        vm.stopBroadcast();

        console2.log("USDC", USDC);
        console2.log("FACTORY", address(factory));
        console2.log("DEPLOYER", deployer);
    }
}
