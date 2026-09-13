pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {ChapterFactory} from "../src/ChapterFactory.sol";
import {ChapterCurve} from "../src/ChapterCurve.sol";
import {ChapterMath} from "../src/ChapterMath.sol";
import {StoryToken} from "../src/StoryToken.sol";
import {GraduateAMM} from "../src/GraduateAMM.sol";
import {MockUSDC} from "./MockUSDC.sol";

contract ChapterCurveTest is Test {
    ChapterFactory factory;
    MockUSDC usdc;
    address author = address(0xA11CE);
    address buyer = address(0xB0B);
    address treasury = address(0xFEE);

    function setUp() public {
        factory = new ChapterFactory(address(this), treasury);
        usdc = new MockUSDC();
        factory.setQuote(address(usdc), true);
        usdc.mint(author, 1_000_000e6);
        usdc.mint(buyer, 2_000_000e6);
    }

    function _params(uint256 graduateTarget, uint256 seed)
        internal
        view
        returns (ChapterFactory.CreateParams memory p)
    {
        p = ChapterFactory.CreateParams({
            name: "Once Upon",
            symbol: "CHAP",
            uri: "ipfs://chapter",
            quote: address(usdc),
            engine: 0,
            authorBps: 100,
            protocolBps: 20,
            pieceBps: 0,
            graduateQuoteTarget: graduateTarget,
            feeRecipient: author,
            seedQuote: seed,
            minBaseOut: 0
        });
    }

    function _open(uint256 graduateTarget) internal returns (bytes32 id, ChapterCurve curve, StoryToken token) {
        vm.startPrank(author);
        (bytes32 storyId, address curveAddr, address tokenAddr) = factory.createStory(_params(graduateTarget, 0));
        vm.stopPrank();
        id = storyId;
        curve = ChapterCurve(curveAddr);
        token = StoryToken(tokenAddr);
    }

    function testCreateLeavesZeroRealQuote() public {
        (, ChapterCurve curve,) = _open(50e6);
        (bool graduated_,,, uint256 realQuote,, uint256 k, uint256 target,) = curve.snapshot();
        (uint256 rq, uint256 progressTarget,) = curve.progress(bytes32(0));
        assertEq(rq, 0);
        assertEq(realQuote, 0);
        assertEq(progressTarget, 50e6);
        assertEq(target, 50e6);
        assertFalse(graduated_);
        assertGt(k, 0);
        assertEq(usdc.balanceOf(address(curve)), 0);
    }

    function testSecondWalletBuysWithNoAuthorSeed() public {
        (, ChapterCurve curve, StoryToken token) = _open(5_000e6);
        uint256 quoteIn = 10e6;
        (uint256 expected,,) = curve.quoteBuy(bytes32(0), quoteIn);

        vm.startPrank(buyer);
        usdc.approve(address(curve), quoteIn);
        uint256 out = curve.buy(quoteIn, 0);
        vm.stopPrank();

        assertEq(out, expected);
        assertGt(out, 0);
        assertEq(token.balanceOf(buyer), out);

        (uint256 realQuote,,) = curve.progress(bytes32(0));
        uint256 fee = (quoteIn * 120) / 10_000;
        assertEq(realQuote, quoteIn - fee);
        assertEq(usdc.balanceOf(author), 1_000_000e6 + (quoteIn * 100) / 10_000);
        assertEq(usdc.balanceOf(treasury), (quoteIn * 20) / 10_000);
    }

    function testKHoldsAfterBuy() public {
        (, ChapterCurve curve,) = _open(5_000e6);
        (,,,,, uint256 k,,) = curve.snapshot();
        vm.startPrank(buyer);
        usdc.approve(address(curve), 10e6);
        curve.buy(10e6, 0);
        vm.stopPrank();
        (, uint256 vq, uint256 vb,,,,,) = curve.snapshot();
        assertLe(vq * vb, k);
        assertLt(k - (vq * vb), vq);
    }

    function testSellReturnsQuoteFromVault() public {
        (, ChapterCurve curve, StoryToken token) = _open(5_000e6);
        vm.startPrank(buyer);
        usdc.approve(address(curve), 10e6);
        uint256 bought = curve.buy(10e6, 0);
        (uint256 before,,) = curve.progress(bytes32(0));
        token.approve(address(curve), bought);
        uint256 got = curve.sell(bought, 0);
        vm.stopPrank();
        assertGt(got, 0);
        (uint256 afterQuote,,) = curve.progress(bytes32(0));
        assertLt(afterQuote, before);
    }

    function testCrossingBuyGraduatesAndCurveBuyReverts() public {
        (, ChapterCurve curve,) = _open(20e6);
        vm.startPrank(buyer);
        usdc.approve(address(curve), 100e6);
        curve.buy(10e6, 0);
        curve.buy(15e6, 0);
        vm.stopPrank();
        (bool graduated_,,,,,,,) = curve.snapshot();
        assertTrue(graduated_);
        assertTrue(address(curve.amm()) != address(0));
        GraduateAMM pair = curve.amm();
        (uint256 r0, uint256 r1) = pair.getReserves();
        assertGt(r0, 0);
        assertGt(r1, 0);

        vm.startPrank(buyer);
        usdc.approve(address(curve), 1e6);
        vm.expectRevert(ChapterCurve.CurveClosed.selector);
        curve.buy(1e6, 0);
        vm.stopPrank();
    }

    function testPauseBlocksCreateOnly() public {
        factory.setPaused(true);
        vm.prank(author);
        vm.expectRevert(ChapterFactory.Paused.selector);
        factory.createStory(_params(50e6, 0));

        factory.setPaused(false);
        (, ChapterCurve curve,) = _open(5_000e6);
        factory.setPaused(true);
        vm.startPrank(buyer);
        usdc.approve(address(curve), 10e6);
        uint256 out = curve.buy(10e6, 0);
        vm.stopPrank();
        assertGt(out, 0);
    }

    function testAuthorCap() public {
        ChapterFactory.CreateParams memory p = _params(50e6, 0);
        p.authorBps = 301;
        vm.prank(author);
        vm.expectRevert();
        factory.createStory(p);
    }

    function testVaultBalancesMatchStored() public {
        (, ChapterCurve curve, StoryToken token) = _open(5_000e6);
        vm.startPrank(buyer);
        usdc.approve(address(curve), 10e6);
        curve.buy(10e6, 0);
        vm.stopPrank();
        (,,, uint256 realQuote, uint256 realBase,,,) = curve.snapshot();
        assertEq(usdc.balanceOf(address(curve)), realQuote);
        assertEq(token.balanceOf(address(curve)), realBase);
    }

    function testOptionalSeedIsNotRequiredAndZeroLeavesBookEmpty() public {
        vm.startPrank(author);
        usdc.approve(address(factory), 0);
        (, address curveAddr,) = factory.createStory(_params(5_000e6, 0));
        vm.stopPrank();
        ChapterCurve curve = ChapterCurve(curveAddr);
        (,,, uint256 realQuote,,,,) = curve.snapshot();
        assertEq(realQuote, 0);
    }

    function testWouldEatLpReserveWithoutGraduation() public {
        (, ChapterCurve curve,) = _open(100_000e6);
        uint256 quoteIn = 15_000e6;
        vm.startPrank(buyer);
        usdc.approve(address(curve), quoteIn);
        vm.expectRevert(ChapterMath.WouldEatLpReserve.selector);
        curve.buy(quoteIn, 0);
        vm.stopPrank();
    }

    function testSellCannotPayVirtualQuote() public {
        (, ChapterCurve curve, StoryToken token) = _open(5_000e6);
        vm.startPrank(buyer);
        usdc.approve(address(curve), 10e6);
        uint256 bought = curve.buy(10e6, 0);
        vm.stopPrank();
        deal(address(token), buyer, bought + 1e24);
        vm.startPrank(buyer);
        token.approve(address(curve), type(uint256).max);
        vm.expectRevert(ChapterMath.VaultDry.selector);
        curve.sell(bought + 1e24, 0);
        vm.stopPrank();
    }

    function testQuoteAssetIsNotAForeignPool() public {
        // The Chapter market is the curve itself. Factory allowlists the quote mint (USDC),
        // never a Raydium NVDAx/USDC pool id.
        assertTrue(factory.quoteAllowed(address(usdc)));
        assertFalse(factory.quoteAllowed(address(0x49)));
    }

    function testDefaultsMatchSpecStartCap() public {
        uint256 supply = ChapterMath.DEFAULT_SUPPLY_UI * 1e18;
        uint256 virtualBase = ChapterMath.DEFAULT_VIRTUAL_BASE_UI * 1e18;
        uint256 startCap = ChapterMath.DEFAULT_START_CAP_UI * 1e6;
        uint256 vq = ChapterMath.virtualQuoteFor(startCap, virtualBase, supply);
        // 3000 * 1.073e9 / 1e9 = 3219 USDC (6 decimals → 3219e6).
        assertEq(vq, 3_219e6);
        assertEq(ChapterMath.lpReserved(supply), supply * 2_000 / 10_000);
    }
}
