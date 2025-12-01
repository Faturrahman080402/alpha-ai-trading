import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PriceChartProps {
  symbol: string;
}

const PriceChart = ({ symbol }: PriceChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeframe, setTimeframe] = useState("1H");
  const [priceData, setPriceData] = useState<number[]>([]);

  useEffect(() => {
    // Generate realistic price data
    const generatePriceData = () => {
      const basePrice = 43000;
      const data: number[] = [];
      let price = basePrice;

      for (let i = 0; i < 100; i++) {
        const change = (Math.random() - 0.48) * 200;
        price = Math.max(price + change, basePrice * 0.95);
        data.push(price);
      }
      return data;
    };

    setPriceData(generatePriceData());

    // Update price every 2 seconds
    const interval = setInterval(() => {
      setPriceData((prev) => {
        const newData = [...prev];
        const lastPrice = newData[newData.length - 1];
        const change = (Math.random() - 0.48) * 100;
        newData.push(Math.max(lastPrice + change, 40000));
        return newData.slice(-100);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [symbol]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || priceData.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate min and max prices
    const minPrice = Math.min(...priceData);
    const maxPrice = Math.max(...priceData);
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

    // Draw price line
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.8)");
    gradient.addColorStop(1, "rgba(147, 51, 234, 0.8)");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();

    priceData.forEach((price, index) => {
      const x = (width / (priceData.length - 1)) * index;
      const y = height - ((price - minPrice) / priceRange) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Fill area under line
    const areaGradient = ctx.createLinearGradient(0, 0, 0, height);
    areaGradient.addColorStop(0, "rgba(59, 130, 246, 0.2)");
    areaGradient.addColorStop(1, "rgba(59, 130, 246, 0)");

    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fillStyle = areaGradient;
    ctx.fill();

  }, [priceData]);

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
