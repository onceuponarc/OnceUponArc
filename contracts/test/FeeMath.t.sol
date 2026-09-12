pragma solidity ^0.8.26;

import {FeeMath} from "../src/FeeMath.sol";

contract FeeMathTest {
    function testAuthorModeAllows300() public pure {
        FeeMath.requireAuthorBps(0, 300);
    }

    function testOnceUponersAllows100() public pure {
        FeeMath.requireAuthorBps(1, 100);
    }

    function testAuthorModeRejects301() public {
        try this.callRequire(0, 301) {
            revert("expected cap");
        } catch {}
    }

    function testOnceUponersRejects101() public {
        try this.callRequire(1, 101) {
            revert("expected cap");
        } catch {}
    }

    function callRequire(uint8 engine, uint16 bps) external pure {
        FeeMath.requireAuthorBps(engine, bps);
    }
}
