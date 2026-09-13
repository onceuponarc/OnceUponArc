pragma solidity ^0.8.26;

/// @notice Records the live Chapter Curve, then the graduated AMM.
contract BindingRegistry {
    address public immutable factory;

    struct Binding {
        bytes32 storyId;
        address curve;
        address amm;
        address quote;
        address token;
    }

    mapping(bytes32 => Binding) public bindings;
    mapping(address => bytes32) public byToken;

    event CurveBound(bytes32 indexed storyId, address indexed curve, address token, address quote);
    event AmmBound(bytes32 indexed storyId, address indexed amm);

    constructor() {
        factory = msg.sender;
    }

    function bindCurve(bytes32 storyId, address curve, address token, address quote) external {
        require(msg.sender == factory, "factory");
        Binding storage b = bindings[storyId];
        require(b.curve == address(0) || b.curve == curve, "bound");
        b.storyId = storyId;
        b.curve = curve;
        b.token = token;
        b.quote = quote;
        byToken[token] = storyId;
        emit CurveBound(storyId, curve, token, quote);
    }

    function bindAmm(bytes32 storyId, address amm) external {
        Binding storage b = bindings[storyId];
        require(b.curve != address(0), "no curve");
        require(msg.sender == b.curve, "only curve");
        b.amm = amm;
        emit AmmBound(storyId, amm);
    }
}
