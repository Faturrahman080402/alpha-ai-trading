import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
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

const PriceChart = ({ symbol }: PriceChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeframe, setTimeframe] = useState("1H");
  const [candleData, setCandleData] = useState<CandleData[]>([]);

  useEffect(() => {
    // Generate realistic candlestick data
    const generateCandleData = () => {
      const basePrice = 43000;
      const data: CandleData[] = [];
      let currentPrice = basePrice;

      for (let i = 0; i < 50; i++) {
        const open = currentPrice;
        const change = (Math.random() - 0.48) * 300;
        const close = Math.max(open + change, basePrice * 0.95);
        
        const high = Math.max(open, close) + Math.random() * 150;
        const low = Math.min(open, close) - Math.random() * 150;

        data.push({
          open,
          high,
          low,
          close,
          time: Date.now() - (50 - i) * 60000,
        });
        
        currentPrice = close;
      }
      return data;
    };

    setCandleData(generateCandleData());

    // Update with new candle every 3 seconds
    const interval = setInterval(() => {
      setCandleData((prev) => {
        const newData = [...prev];
        const lastCandle = newData[newData.length - 1];
        const open = lastCandle.close;
        const change = (Math.random() - 0.48) * 200;
        const close = Math.max(open + change, 40000);
        
        const high = Math.max(open, close) + Math.random() * 100;
        const low = Math.min(open, close) - Math.random() * 100;

        newData.push({
          open,
          high,
          low,
          close,
          time: Date.now(),
        });
        return newData.slice(-50);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [symbol]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candleData.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate min and max prices from all OHLC values
    const allPrices = candleData.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;

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

    // Calculate candle width and spacing
    const candleWidth = Math.max(2, (width / candleData.length) * 0.6);
    const candleSpacing = width / candleData.length;

    // Draw candlesticks
    candleData.forEach((candle, index) => {
      const x = index * candleSpacing + candleSpacing / 2;
      
      // Calculate y positions
      const yHigh = height - ((candle.high - minPrice) / priceRange) * height;
      const yLow = height - ((candle.low - minPrice) / priceRange) * height;
      const yOpen = height - ((candle.open - minPrice) / priceRange) * height;
      const yClose = height - ((candle.close - minPrice) / priceRange) * height;

      // Determine candle color (green for bullish, red for bearish)
      const isBullish = candle.close >= candle.open;
      const color = isBullish ? "rgba(34, 197, 94, 0.9)" : "rgba(239, 68, 68, 0.9)";
      const borderColor = isBullish ? "rgba(34, 197, 94, 1)" : "rgba(239, 68, 68, 1)";

      // Draw wick (high-low line)
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      // Draw candle body (open-close rectangle)
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.abs(yClose - yOpen) || 1; // Minimum height of 1px for doji candles
      
      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      
      // Draw candle border
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    });

  }, [candleData]);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {["1M", "5M", "15M", "1H", "4H", "1D"].map((tf) => (
          <Button
            key={tf}
            variant={timeframe === tf ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeframe(tf)}
            className="text-xs"
          >
            {tf}
          </Button>
        ))}
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          className="w-full h-[300px] rounded-lg"
        />
        <div className="absolute top-2 right-2 text-xs text-muted-foreground">
          Live • Updated 2s ago
        </div>
      </div>
    </div>
  );
};

export default PriceChart;
