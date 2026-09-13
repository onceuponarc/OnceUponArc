pragma solidity ^0.8.26;

/// @dev Indexer depends on this exact shape (Chapter 10).
interface IStoryEvents {
    event StoryCreated(
        bytes32 indexed storyId,
        address indexed token,
        address indexed author,
        uint8 engine,
        address feeRecipient,
        address vault,
        uint16 authorBps,
        uint16 protocolBps,
        address quote,
        address binding,
        string ticker
    );

    event AuthorFeePaid(
        bytes32 indexed story,
        address indexed swapper,
        address indexed recipient,
        address asset,
        uint256 amount,
        uint16 bps
    );

    event PieceAccrued(bytes32 indexed story, address indexed asset, uint256 amount);
    event PieceClaimed(bytes32 indexed story, address indexed user, address asset, uint256 amount);

    event CurveOpened(
        bytes32 indexed storyId,
        address indexed token,
        address indexed quote,
        uint256 virtualQuote,
        uint256 virtualBase,
        uint256 graduateQuoteTarget
    );

    event Graduated(
        bytes32 indexed storyId,
        address indexed pool,
        uint256 realQuote,
        uint256 realBase,
        uint256 priceX18
    );
}
