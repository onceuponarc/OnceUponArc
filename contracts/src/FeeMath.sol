pragma solidity ^0.8.26;

library FeeMath {
    uint16 public constant AUTHOR_MODE_CAP_BPS = 300;
    uint16 public constant ONCEUPONERS_AUTHOR_CAP_BPS = 100;

    error AuthorBpsCap();

    function requireAuthorBps(uint8 engine, uint16 authorBps) internal pure {
        uint16 cap = engine == 0 ? AUTHOR_MODE_CAP_BPS : ONCEUPONERS_AUTHOR_CAP_BPS;
        if (authorBps > cap) revert AuthorBpsCap();
    }
}
