"use client";

import { useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  createChart,
  type IChartApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { candlesFromTrades, CHART_TFS, type ChartTf } from "@/lib/chart";
import type { ChartTrade } from "@/lib/chart";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

export function TokenChart({
  trades,
  fallbackPrice,
}: {
  trades: ChartTrade[];
  fallbackPrice: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [tf, setTf] = useState<ChartTf>("1m");
  const [mode, setMode] = useState<"candles" | "line">("candles");
  const candles = candlesFromTrades(trades, tf, fallbackPrice);
  const last = candles.at(-1)?.close ?? fallbackPrice;
  const first = candles[0]?.close ?? last;
  const up = last >= first;

  useEffect(() => {
    if (!host.current) return;
    const chart = createChart(host.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#000000" },
        textColor: "#a3a3a3",
        fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.06)" },
        horzLines: { color: "rgba(255,255,255,0.06)" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.12)" },
      timeScale: { borderColor: "rgba(255,255,255,0.12)", timeVisible: true, secondsVisible: tf === "1s" || tf === "1m" },
      autoSize: true,
    });
    chartRef.current = chart;
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#ffffff",
      downColor: "#525252",
      borderUpColor: "#ffffff",
      borderDownColor: "#525252",
      wickUpColor: "#ffffff",
      wickDownColor: "#737373",
    });
    const lineSeries = chart.addSeries(LineSeries, {
      color: "#ffffff",
      lineWidth: 2,
    });
    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
    });
    chart.priceScale("vol").applyOptions({
      scaleMargins: { top: 0.78, bottom: 0 },
    });

    function paint() {
      const rows = candlesFromTrades(trades, tf, fallbackPrice);
      const ohlc = rows.map((row) => ({
        time: row.time as UTCTimestamp,
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
      }));
      const line = rows.map((row) => ({ time: row.time as UTCTimestamp, value: row.close }));
      const vols = rows.map((row) => ({
        time: row.time as UTCTimestamp,
        value: row.volume,
        color: row.close >= row.open ? "rgba(255,255,255,0.45)" : "rgba(115,115,115,0.7)",
      }));
      candleSeries.setData(mode === "candles" ? ohlc : []);
      lineSeries.setData(mode === "line" ? line : []);
      volume.setData(vols);
      chart.timeScale().fitContent();
    }

    paint();
    const onResize = () => chart.applyOptions({ autoSize: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [trades, tf, mode, fallbackPrice]);

  const vol = trades.reduce((sum, item) => sum + item.quoteUi, 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
      <div className="flex flex-wrap items-end justify-between gap-3 px-4 pt-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Price</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{formatUsd(last, 6)}</p>
        </div>
        <div className="text-right text-sm">
          <p className={up ? "text-buy" : "text-sell"}>
            {up ? "+" : ""}
            {(((last - first) / (first || 1)) * 100).toFixed(2)}%
          </p>
          <p className="text-white/45">{formatUsd(vol)} vol</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-4">
        <div className="flex gap-1">
          {CHART_TFS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTf(item.id)}
              className={cn(
                "rounded-md px-2 py-1 font-mono text-[11px] uppercase transition-colors",
                tf === item.id ? "bg-white text-black" : "text-white/45 hover:text-white",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["candles", "line"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={cn(
                "rounded-md px-2 py-1 font-mono text-[11px] uppercase transition-colors",
                mode === item ? "bg-white text-black" : "text-white/45 hover:text-white",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div ref={host} className="h-[340px] w-full sm:h-[420px]" />
    </div>
  );
}
