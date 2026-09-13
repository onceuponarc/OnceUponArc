pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {ChapterFactory} from "../src/ChapterFactory.sol";
import {MockUSDC} from "../test/MockUSDC.sol";

/// @notice Anvil / Arc-shaped Chapter Factory with a funded test wallet.
contract DeployDevnet is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address trader = vm.envAddress("TRADER");
        address deployer = vm.addr(pk);

        vm.startBroadcast(pk);
        MockUSDC usdc = new MockUSDC();
        ChapterFactory factory = new ChapterFactory(deployer, deployer);
        factory.setQuote(address(usdc), true);
        usdc.mint(trader, 1_000_000 * 1e6);
        usdc.mint(deployer, 1_000_000 * 1e6);
        vm.stopBroadcast();

        console2.log("USDC", address(usdc));
        console2.log("FACTORY", address(factory));
        console2.log("DEPLOYER", deployer);
        console2.log("TRADER", trader);
    }
}
