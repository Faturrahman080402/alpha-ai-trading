import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface PriceChartProps {
  symbol: string;
}

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  time: number;
}

type Timeframe = "1M" | "5M" | "15M" | "1H" | "4H" | "1D";

interface TimeframeConfig {
  label: string;
  candleCount: number;
  intervalMs: number;
  priceVariance: number;
  wickMultiplier: number;
}

const TIMEFRAME_CONFIGS: Record<Timeframe, TimeframeConfig> = {
  "1M": { label: "1m", candleCount: 60, intervalMs: 1000, priceVariance: 50, wickMultiplier: 0.3 },
  "5M": { label: "5m", candleCount: 50, intervalMs: 2000, priceVariance: 100, wickMultiplier: 0.4 },
  "15M": { label: "15m", candleCount: 48, intervalMs: 3000, priceVariance: 150, wickMultiplier: 0.5 },
  "1H": { label: "1H", candleCount: 48, intervalMs: 5000, priceVariance: 250, wickMultiplier: 0.6 },
  "4H": { label: "4H", candleCount: 42, intervalMs: 8000, priceVariance: 400, wickMultiplier: 0.7 },
  "1D": { label: "1D", candleCount: 30, intervalMs: 10000, priceVariance: 800, wickMultiplier: 0.8 },
};

const TIMEFRAMES: Timeframe[] = ["1M", "5M", "15M", "1H", "4H", "1D"];

const PriceChart = ({ symbol }: PriceChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>("1H");
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const config = useMemo(() => TIMEFRAME_CONFIGS[timeframe], [timeframe]);

  const generateCandleData = useCallback((tf: Timeframe): CandleData[] => {
    const tfConfig = TIMEFRAME_CONFIGS[tf];
    const basePrice = 43000;
    const data: CandleData[] = [];
    let currentPrice = basePrice;

    for (let i = 0; i < tfConfig.candleCount; i++) {
      const open = currentPrice;
      const change = (Math.random() - 0.48) * tfConfig.priceVariance;
      const close = Math.max(open + change, basePrice * 0.9);
      
      const high = Math.max(open, close) + Math.random() * tfConfig.priceVariance * tfConfig.wickMultiplier;
      const low = Math.min(open, close) - Math.random() * tfConfig.priceVariance * tfConfig.wickMultiplier;

      data.push({
        open,
        high,
        low,
        close,
        time: Date.now() - (tfConfig.candleCount - i) * 60000,
      });
      
      currentPrice = close;
    }
    return data;
  }, []);

  // Regenerate data when timeframe changes
  useEffect(() => {
    setCandleData(generateCandleData(timeframe));
    setLastUpdate(new Date());
  }, [timeframe, generateCandleData]);

  // Update with new candle based on timeframe interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCandleData((prev) => {
        if (prev.length === 0) return prev;
        
        const newData = [...prev];
        const lastCandle = newData[newData.length - 1];
        const open = lastCandle.close;
        const change = (Math.random() - 0.48) * config.priceVariance * 0.5;
        const close = Math.max(open + change, 40000);
        
        const high = Math.max(open, close) + Math.random() * config.priceVariance * config.wickMultiplier * 0.5;
        const low = Math.min(open, close) - Math.random() * config.priceVariance * config.wickMultiplier * 0.5;

        newData.push({
          open,
          high,
          low,
          close,
          time: Date.now(),
        });
        
        return newData.slice(-config.candleCount);
      });
      setLastUpdate(new Date());
    }, config.intervalMs);

    return () => clearInterval(interval);
  }, [config]);

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candleData.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const allPrices = candleData.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice || 1;

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;

    for (let i = 0; i < 5; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const candleWidth = Math.max(2, (width / candleData.length) * 0.6);
    const candleSpacing = width / candleData.length;

    candleData.forEach((candle, index) => {
      const x = index * candleSpacing + candleSpacing / 2;
      
      const yHigh = height - ((candle.high - minPrice) / priceRange) * height;
      const yLow = height - ((candle.low - minPrice) / priceRange) * height;
      const yOpen = height - ((candle.open - minPrice) / priceRange) * height;
      const yClose = height - ((candle.close - minPrice) / priceRange) * height;

      const isBullish = candle.close >= candle.open;
      const color = isBullish ? "rgba(34, 197, 94, 0.9)" : "rgba(239, 68, 68, 0.9)";
      const borderColor = isBullish ? "rgba(34, 197, 94, 1)" : "rgba(239, 68, 68, 1)";

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.abs(yClose - yOpen) || 1;
      
      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    });

  }, [candleData]);

  const getTimeSinceUpdate = () => {
    const seconds = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
    return seconds < 1 ? "now" : `${seconds}s ago`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
          {TIMEFRAMES.map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeframe(tf)}
              className={`text-xs px-3 py-1 h-7 transition-all ${
                timeframe === tf 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {TIMEFRAME_CONFIGS[tf].label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </span>
          <span>• Updated {getTimeSinceUpdate()}</span>
        </div>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          className="w-full h-[300px] rounded-lg bg-card/50"
        />
      </div>
    </div>
  );
};

export default PriceChart;
