pragma solidity ^0.8.26;

/// @notice Constant-product identities for the Chapter Curve.
///         virtualQuote and virtualBase never move as tokens. k is fixed at create.
///         Integer division floors; after a trade, virtualQuote * virtualBase <= k
///         and the shortfall is < the grown virtualQuote (buy) or virtualBase (sell).
library ChapterMath {
    uint16 public constant MAX_CURVE_FEE_BPS = 400;
    uint16 public constant TRADABLE_BPS = 8_000;
    uint16 public constant LP_RESERVED_BPS = 2_000;
    uint256 public constant DEFAULT_VIRTUAL_BASE_UI = 1_073_000_000;
    uint256 public constant DEFAULT_SUPPLY_UI = 1_000_000_000;
    uint256 public constant DEFAULT_START_CAP_UI = 3_000;
    uint256 public constant DEFAULT_GRADUATE_UI = 5_000;

    error ZeroAmount();
    error Slippage();
    error WouldEatLpReserve();
    error VaultDry();
    error FeeTooHigh();

    function virtualQuoteFor(uint256 startCapUi, uint256 virtualBaseUi, uint256 supplyUi)
        internal
        pure
        returns (uint256)
    {
        if (supplyUi == 0) return startCapUi;
        return (startCapUi * virtualBaseUi) / supplyUi;
    }

    function lpReserved(uint256 totalSupply) internal pure returns (uint256) {
        return (totalSupply * LP_RESERVED_BPS) / 10_000;
    }

    function splitFee(uint256 amount, uint16 bps) internal pure returns (uint256 fee, uint256 net) {
        if (bps > MAX_CURVE_FEE_BPS) revert FeeTooHigh();
        fee = (amount * bps) / 10_000;
        net = amount - fee;
    }

    /// @dev Buy: quote in → base out. Fee is stripped before the invariant.
    ///      k is the create-time product and stays fixed. newBase = k / (virtualQuote + netIn).
    function buyBaseOut(uint256 k, uint256 virtualQuote, uint256 virtualBase, uint256 netIn)
        internal
        pure
        returns (uint256 baseOut)
    {
        if (netIn == 0 || k == 0) revert ZeroAmount();
        uint256 newQuote = virtualQuote + netIn;
        uint256 newBase = k / newQuote;
        if (newBase >= virtualBase) revert ZeroAmount();
        baseOut = virtualBase - newBase;
        if (baseOut == 0) revert ZeroAmount();
    }

    /// @dev Sell: base in → quote out (gross, before fee). Uses the same fixed k.
    function sellQuoteOutGross(uint256 k, uint256 virtualQuote, uint256 virtualBase, uint256 baseIn)
        internal
        pure
        returns (uint256 quoteOutGross)
    {
        if (baseIn == 0 || k == 0) revert ZeroAmount();
        uint256 newBase = virtualBase + baseIn;
        uint256 newQuote = k / newBase;
        if (newQuote >= virtualQuote) revert ZeroAmount();
        quoteOutGross = virtualQuote - newQuote;
        if (quoteOutGross == 0) revert ZeroAmount();
    }

    function afterBuy(uint256 k, uint256 virtualQuote, uint256 netIn)
        internal
        pure
        returns (uint256 newQuote, uint256 newBase)
    {
        newQuote = virtualQuote + netIn;
        newBase = k / newQuote;
    }

    function afterSell(uint256 k, uint256 virtualBase, uint256 baseIn)
        internal
        pure
        returns (uint256 newQuote, uint256 newBase)
    {
        newBase = virtualBase + baseIn;
        newQuote = k / newBase;
    }
}
