pragma solidity ^0.8.26;

import {IERC20, SafeERC20} from "./IERC20.sol";
import {StoryToken} from "./StoryToken.sol";
import {PieceVault} from "./PieceVault.sol";
import {ChapterCurve} from "./ChapterCurve.sol";
import {BindingRegistry} from "./BindingRegistry.sol";
import {ChapterMath} from "./ChapterMath.sol";
import {FeeMath} from "./FeeMath.sol";
import {IStoryEvents} from "./IStoryEvents.sol";

contract ChapterFactory is IStoryEvents {
    using SafeERC20 for IERC20;

    struct CreateParams {
        string name;
        string symbol;
        string uri;
        address quote;
        uint8 engine;
        uint16 authorBps;
        uint16 protocolBps;
        uint16 pieceBps;
        uint256 graduateQuoteTarget;
        address feeRecipient;
        uint256 seedQuote;
        uint256 minBaseOut;
    }

    address public owner;
    address public protocolTreasury;
    bool public paused;
    uint256 public nonce;
    BindingRegistry public immutable registry;
    mapping(address => bool) public quoteAllowed;
    mapping(bytes32 => address) public curves;

    error NotOwner();
    error Paused();
    error QuoteNotAllowed();

    constructor(address owner_, address protocolTreasury_) {
        owner = owner_;
        protocolTreasury = protocolTreasury_;
        registry = new BindingRegistry();
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    function setPaused(bool paused_) external onlyOwner {
        paused = paused_;
    }

    function setQuote(address quote, bool allowed) external onlyOwner {
        quoteAllowed[quote] = allowed;
    }

    function setTreasury(address treasury) external onlyOwner {
        protocolTreasury = treasury;
    }

    function createStory(CreateParams calldata p)
        external
        payable
        returns (bytes32 storyId, address curveAddr, address tokenAddr)
    {
        if (paused) revert Paused();
        if (!quoteAllowed[p.quote]) revert QuoteNotAllowed();
        FeeMath.requireAuthorBps(p.engine, p.authorBps);

        uint8 tokenDecimals = 18;
        uint256 supply = ChapterMath.DEFAULT_SUPPLY_UI * (10 ** tokenDecimals);
        uint256 virtualBase = ChapterMath.DEFAULT_VIRTUAL_BASE_UI * (10 ** tokenDecimals);
        uint8 quoteDecimals = IERC20(p.quote).decimals();
        uint256 startCap = ChapterMath.DEFAULT_START_CAP_UI * (10 ** quoteDecimals);
        uint256 virtualQuote = ChapterMath.virtualQuoteFor(startCap, virtualBase, supply);
        uint256 graduateTarget = p.graduateQuoteTarget == 0
            ? ChapterMath.DEFAULT_GRADUATE_UI * (10 ** quoteDecimals)
            : p.graduateQuoteTarget;
        uint256 lpReserved = ChapterMath.lpReserved(supply);

        nonce += 1;
        storyId = keccak256(abi.encode(block.chainid, address(this), nonce, msg.sender, p.symbol));

        StoryToken token = new StoryToken(p.name, p.symbol, tokenDecimals, p.uri, address(this));
        tokenAddr = address(token);

        address pieceVault = address(0);
        address feeRecipient = p.feeRecipient == address(0) ? msg.sender : p.feeRecipient;

        ChapterCurve curve = new ChapterCurve(
            ChapterCurve.Init({
                storyId: storyId,
                token: address(token),
                quote: p.quote,
                engine: p.engine,
                author: msg.sender,
                feeRecipient: feeRecipient,
                pieceVault: pieceVault,
                protocolTreasury: protocolTreasury,
                authorBps: p.authorBps,
                protocolBps: p.protocolBps == 0 ? 20 : p.protocolBps,
                pieceBps: p.engine == 0 ? 0 : p.pieceBps,
                virtualQuote: virtualQuote,
                virtualBase: virtualBase,
                graduateQuoteTarget: graduateTarget,
                lpBaseReserved: lpReserved,
                registry: registry
            })
        );
        curveAddr = address(curve);

        token.mint(address(curve), supply);
        token.transferMinter(address(curve));
        curve.fundBase();

        if (p.engine == 1) {
            PieceVault vault = new PieceVault(IERC20(address(token)), address(curve), msg.sender);
            curve.setPieceVault(address(vault));
            pieceVault = address(vault);
        }

        registry.bindCurve(storyId, address(curve), address(token), p.quote);
        curves[storyId] = address(curve);

        emit StoryCreated(
            storyId,
            address(token),
            msg.sender,
            p.engine,
            feeRecipient,
            pieceVault,
            p.authorBps,
            p.protocolBps == 0 ? 20 : p.protocolBps,
            p.quote,
            address(registry),
            p.symbol
        );

        if (p.seedQuote > 0) {
            SafeERC20.pull(IERC20(p.quote), msg.sender, address(curve), p.seedQuote);
            curve.buyFromBalance(msg.sender, p.seedQuote, p.minBaseOut);
        }
    }
}
