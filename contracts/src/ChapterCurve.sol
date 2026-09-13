pragma solidity ^0.8.26;

import {IERC20, SafeERC20} from "./IERC20.sol";
import {StoryToken} from "./StoryToken.sol";
import {PieceVault} from "./PieceVault.sol";
import {AuthorFeeHook} from "./AuthorFeeHook.sol";
import {GraduateAMM} from "./GraduateAMM.sol";
import {BindingRegistry} from "./BindingRegistry.sol";
import {ChapterMath} from "./ChapterMath.sol";
import {FeeMath} from "./FeeMath.sol";
import {IStoryEvents} from "./IStoryEvents.sol";

/// @notice One Chapter Curve per Story. Buys feed quoteVault. Graduation seeds the AMM.
contract ChapterCurve is IStoryEvents {
    using SafeERC20 for IERC20;

    uint8 public constant ENGINE_AUTHOR = 0;
    uint8 public constant ENGINE_ONCEUPONERS = 1;

    struct Curve {
        bytes32 storyId;
        address token;
        address quote;
        uint8 engine;
        address author;
        address feeRecipient;
        address pieceVault;
        address protocolTreasury;
        uint16 authorBps;
        uint16 protocolBps;
        uint16 pieceBps;
        uint16 curveFeeBps;
        bool graduated;
        uint256 virtualQuote;
        uint256 virtualBase;
        uint256 realQuote;
        uint256 realBase;
        uint256 k;
        uint256 graduateQuoteTarget;
        uint256 lpBaseReserved;
    }

    struct Init {
        bytes32 storyId;
        address token;
        address quote;
        uint8 engine;
        address author;
        address feeRecipient;
        address pieceVault;
        address protocolTreasury;
        uint16 authorBps;
        uint16 protocolBps;
        uint16 pieceBps;
        uint256 virtualQuote;
        uint256 virtualBase;
        uint256 graduateQuoteTarget;
        uint256 lpBaseReserved;
        BindingRegistry registry;
    }

    Curve public curve;
    BindingRegistry public registry;
    GraduateAMM public amm;
    address public factory;
    uint256 private locked;

    error CurveClosed();
    error Reentrancy();
    error NotFactory();
    error TargetNotMet();
    error AlreadyGraduated();
    error VaultMismatch();

    modifier lock() {
        if (locked != 0) revert Reentrancy();
        locked = 1;
        _;
        locked = 0;
    }

    constructor(Init memory i) {
        FeeMath.requireAuthorBps(i.engine, i.authorBps);
        uint16 curveFeeBps = i.authorBps + i.protocolBps + i.pieceBps;
        if (curveFeeBps > ChapterMath.MAX_CURVE_FEE_BPS) revert ChapterMath.FeeTooHigh();
        if (i.engine == ENGINE_AUTHOR && i.pieceBps != 0) revert ChapterMath.FeeTooHigh();

        factory = msg.sender;
        registry = i.registry;
        curve = Curve({
            storyId: i.storyId,
            token: i.token,
            quote: i.quote,
            engine: i.engine,
            author: i.author,
            feeRecipient: i.feeRecipient,
            pieceVault: i.pieceVault,
            protocolTreasury: i.protocolTreasury,
            authorBps: i.authorBps,
            protocolBps: i.protocolBps,
            pieceBps: i.pieceBps,
            curveFeeBps: curveFeeBps,
            graduated: false,
            virtualQuote: i.virtualQuote,
            virtualBase: i.virtualBase,
            realQuote: 0,
            realBase: 0,
            k: i.virtualQuote * i.virtualBase,
            graduateQuoteTarget: i.graduateQuoteTarget,
            lpBaseReserved: i.lpBaseReserved
        });

        emit CurveOpened(i.storyId, i.token, i.quote, i.virtualQuote, i.virtualBase, i.graduateQuoteTarget);
    }

    function fundBase() external {
        if (msg.sender != factory) revert NotFactory();
        if (curve.realBase != 0) revert AlreadyGraduated();
        curve.realBase = IERC20(curve.token).balanceOf(address(this));
    }

    function setPieceVault(address vault) external {
        if (msg.sender != factory) revert NotFactory();
        if (curve.pieceVault != address(0)) revert AlreadyGraduated();
        curve.pieceVault = vault;
    }

    function spotPrice(bytes32) public view returns (uint256 quotePerBaseX18) {
        if (curve.virtualBase == 0) return 0;
        return (curve.virtualQuote * 1e18) / curve.virtualBase;
    }

    function snapshot()
        public
        view
        returns (
            bool graduated_,
            uint256 virtualQuote_,
            uint256 virtualBase_,
            uint256 realQuote_,
            uint256 realBase_,
            uint256 k_,
            uint256 graduateQuoteTarget_,
            uint256 lpBaseReserved_
        )
    {
        Curve storage c = curve;
        return (
            c.graduated,
            c.virtualQuote,
            c.virtualBase,
            c.realQuote,
            c.realBase,
            c.k,
            c.graduateQuoteTarget,
            c.lpBaseReserved
        );
    }

    function progress(bytes32) public view returns (uint256 realQuote, uint256 target, uint16 bpsToGrad) {
        realQuote = curve.realQuote;
        target = curve.graduateQuoteTarget;
        if (target == 0) return (realQuote, target, 10_000);
        uint256 bps = (realQuote * 10_000) / target;
        bpsToGrad = bps > 10_000 ? 10_000 : uint16(bps);
    }

    function quoteBuy(bytes32, uint256 quoteIn)
        public
        view
        returns (uint256 baseOut, uint256 fee, uint256 priceAfter)
    {
        if (curve.graduated) revert CurveClosed();
        (fee,) = ChapterMath.splitFee(quoteIn, curve.curveFeeBps);
        uint256 netIn = quoteIn - fee;
        baseOut = ChapterMath.buyBaseOut(curve.k, curve.virtualQuote, curve.virtualBase, netIn);
        (uint256 vq, uint256 vb) = ChapterMath.afterBuy(curve.k, curve.virtualQuote, netIn);
        priceAfter = vb == 0 ? 0 : (vq * 1e18) / vb;
    }

    function quoteSell(bytes32, uint256 baseIn)
        public
        view
        returns (uint256 quoteOut, uint256 fee, uint256 priceAfter)
    {
        if (curve.graduated) revert CurveClosed();
        uint256 gross = ChapterMath.sellQuoteOutGross(curve.k, curve.virtualQuote, curve.virtualBase, baseIn);
        (fee, quoteOut) = ChapterMath.splitFee(gross, curve.curveFeeBps);
        (uint256 vq, uint256 vb) = ChapterMath.afterSell(curve.k, curve.virtualBase, baseIn);
        priceAfter = vb == 0 ? 0 : (vq * 1e18) / vb;
    }

    function buy(uint256 quoteIn, uint256 minBaseOut) external lock returns (uint256 baseOut) {
        if (curve.graduated) revert CurveClosed();
        if (quoteIn == 0) revert ChapterMath.ZeroAmount();

        IERC20 quote = IERC20(curve.quote);
        StoryToken token = StoryToken(curve.token);
        SafeERC20.pull(quote, msg.sender, address(this), quoteIn);

        uint256 fee = (quoteIn * curve.curveFeeBps) / 10_000;
        uint256 netIn = quoteIn - fee;
        baseOut = ChapterMath.buyBaseOut(curve.k, curve.virtualQuote, curve.virtualBase, netIn);
        if (baseOut < minBaseOut) revert ChapterMath.Slippage();
        if (baseOut > curve.realBase) revert ChapterMath.VaultDry();

        uint256 remaining = curve.realBase - baseOut;
        bool crosses = curve.realQuote + netIn >= curve.graduateQuoteTarget;
        if (remaining < curve.lpBaseReserved && !crosses) revert ChapterMath.WouldEatLpReserve();

        (curve.virtualQuote, curve.virtualBase) = ChapterMath.afterBuy(curve.k, curve.virtualQuote, netIn);
        curve.realQuote += netIn;
        curve.realBase = remaining;

        _splitFee(quote, fee);
        SafeERC20.push(IERC20(address(token)), msg.sender, baseOut);
        _syncVaults();

        if (curve.realQuote >= curve.graduateQuoteTarget) {
            _graduate();
        }
    }

    function sell(uint256 baseIn, uint256 minQuoteOut) external lock returns (uint256 quoteOut) {
        if (curve.graduated) revert CurveClosed();
        if (baseIn == 0) revert ChapterMath.ZeroAmount();

        IERC20 quote = IERC20(curve.quote);
        StoryToken token = StoryToken(curve.token);
        SafeERC20.pull(IERC20(address(token)), msg.sender, address(this), baseIn);

        uint256 gross = ChapterMath.sellQuoteOutGross(curve.k, curve.virtualQuote, curve.virtualBase, baseIn);
        uint256 fee = (gross * curve.curveFeeBps) / 10_000;
        quoteOut = gross - fee;
        if (quoteOut < minQuoteOut) revert ChapterMath.Slippage();
        if (gross > curve.realQuote) revert ChapterMath.VaultDry();

        (curve.virtualQuote, curve.virtualBase) = ChapterMath.afterSell(curve.k, curve.virtualBase, baseIn);
        curve.realBase += baseIn;
        curve.realQuote -= gross;

        _splitFee(quote, fee);
        SafeERC20.push(quote, msg.sender, quoteOut);
        _syncVaults();
    }

    function graduate() public lock {
        _graduate();
    }

    function _graduate() internal {
        if (curve.graduated) revert AlreadyGraduated();
        if (curve.realQuote < curve.graduateQuoteTarget) revert TargetNotMet();
        _syncVaults();

        curve.graduated = true;
        StoryToken(curve.token).renounceMintAuthority();

        GraduateAMM pair = new GraduateAMM();
        IERC20(curve.token).approve(address(pair), type(uint256).max);
        IERC20(curve.quote).approve(address(pair), type(uint256).max);
        uint256 baseAmt = IERC20(curve.token).balanceOf(address(this));
        uint256 quoteAmt = IERC20(curve.quote).balanceOf(address(this));
        pair.seed(IERC20(curve.token), IERC20(curve.quote), baseAmt, quoteAmt);
        amm = pair;
        curve.realQuote = 0;
        curve.realBase = 0;
        registry.bindAmm(curve.storyId, address(pair));

        uint256 price = pair.priceX18();
        emit Graduated(curve.storyId, address(pair), pair.reserve1(), pair.reserve0(), price);
    }

    function _splitFee(IERC20 quote, uint256 fee) internal {
        if (fee == 0) return;
        uint256 totalBps = curve.curveFeeBps;
        uint256 authorCut = totalBps == 0 ? 0 : (fee * curve.authorBps) / totalBps;
        uint256 protocolCut = totalBps == 0 ? 0 : (fee * curve.protocolBps) / totalBps;
        uint256 pieceCut = fee - authorCut - protocolCut;

        AuthorFeeHook.pushOrRescue(quote, curve.feeRecipient, curve.pieceVault == address(0) ? curve.protocolTreasury : curve.pieceVault, authorCut);
        if (authorCut > 0) {
            emit AuthorFeePaid(curve.storyId, msg.sender, curve.feeRecipient, address(quote), authorCut, curve.authorBps);
        }
        if (protocolCut > 0 && curve.protocolTreasury != address(0)) {
            SafeERC20.push(quote, curve.protocolTreasury, protocolCut);
        }
        if (pieceCut > 0 && curve.pieceVault != address(0)) {
            SafeERC20.push(quote, curve.pieceVault, pieceCut);
            PieceVault(curve.pieceVault).accrue(address(quote), pieceCut);
        }
    }

    function _syncVaults() internal view {
        uint256 q = IERC20(curve.quote).balanceOf(address(this));
        uint256 b = IERC20(curve.token).balanceOf(address(this));
        // Fees already left; remaining quote must equal realQuote (dust of 0).
        if (q < curve.realQuote || b < curve.realBase) revert VaultMismatch();
    }

    function seedBuy(address buyer, uint256 quoteIn, uint256 minBaseOut) external returns (uint256) {
        if (msg.sender != factory) revert NotFactory();
        return this.buyFromBalance(buyer, quoteIn, minBaseOut);
    }

    /// @dev Used for the optional same-tx first buy after factory forwarded quote.
    function buyFromBalance(address buyer, uint256 quoteIn, uint256 minBaseOut) external lock returns (uint256 baseOut) {
        if (msg.sender != address(this) && msg.sender != factory) revert NotFactory();
        if (curve.graduated) revert CurveClosed();
        IERC20 quote = IERC20(curve.quote);
        require(quote.balanceOf(address(this)) >= curve.realQuote + quoteIn, "seed quote");

        uint256 fee = (quoteIn * curve.curveFeeBps) / 10_000;
        uint256 netIn = quoteIn - fee;
        baseOut = ChapterMath.buyBaseOut(curve.k, curve.virtualQuote, curve.virtualBase, netIn);
        if (baseOut < minBaseOut) revert ChapterMath.Slippage();
        if (baseOut > curve.realBase) revert ChapterMath.VaultDry();

        uint256 remaining = curve.realBase - baseOut;
        bool crosses = curve.realQuote + netIn >= curve.graduateQuoteTarget;
        if (remaining < curve.lpBaseReserved && !crosses) revert ChapterMath.WouldEatLpReserve();

        (curve.virtualQuote, curve.virtualBase) = ChapterMath.afterBuy(curve.k, curve.virtualQuote, netIn);
        curve.realQuote += netIn;
        curve.realBase = remaining;
        _splitFee(quote, fee);
        SafeERC20.push(IERC20(curve.token), buyer, baseOut);
        _syncVaults();
        if (curve.realQuote >= curve.graduateQuoteTarget) _graduate();
    }
}
