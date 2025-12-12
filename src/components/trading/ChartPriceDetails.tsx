import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Clock, Activity, BarChart3 } from "lucide-react";

interface LivePrice {
  price: number;
  change: number;
  volume: string;
}

interface ChartPriceDetailsProps {
  symbol: string;
  currentPrice: LivePrice | null;
}

const ChartPriceDetails = ({ symbol, currentPrice }: ChartPriceDetailsProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [priceHistory, setPriceHistory] = useState<number[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentPrice?.price) {
      setPriceHistory(prev => {
        const newHistory = [...prev, currentPrice.price];
        return newHistory.slice(-10);
      });
    }
  }, [currentPrice?.price]);

  const high24h = priceHistory.length > 0 ? Math.max(...priceHistory) * 1.02 : (currentPrice?.price ?? 0) * 1.02;
  const low24h = priceHistory.length > 0 ? Math.min(...priceHistory) * 0.98 : (currentPrice?.price ?? 0) * 0.98;
  const isPositive = currentPrice && currentPrice.change >= 0;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {/* Live Clock */}
      <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
          <Clock className="w-3 h-3" />
          <span>Market Time</span>
        </div>
        <div className="font-mono text-xl font-bold text-foreground">
          {formatTime(currentTime)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {formatDate(currentTime)}
        </div>
      </div>

      {/* Current Price */}
      <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
          <Activity className="w-3 h-3" />
          <span>Last Price</span>
        </div>
        <div className={`font-mono text-lg font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
          ${currentPrice?.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}
        </div>
        <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-success' : 'text-danger'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{currentPrice ? `${isPositive ? '+' : ''}${currentPrice.change.toFixed(2)}%` : '—'}</span>
        </div>
      </div>

      {/* 24h Stats */}
      <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
          <BarChart3 className="w-3 h-3" />
          <span>24h Statistics</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">24h High</span>
            <span className="font-mono text-success">
              ${high24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">24h Low</span>
            <span className="font-mono text-danger">
              ${low24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">24h Volume</span>
            <span className="font-mono text-foreground">
              {currentPrice?.volume ?? '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Price Range Bar */}
      <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
        <div className="text-xs text-muted-foreground mb-2">Price Range</div>
        <div className="relative h-2 bg-gradient-to-r from-danger via-muted to-success rounded-full overflow-hidden">
          <div 
            className="absolute top-0 w-2 h-2 bg-foreground rounded-full transform -translate-x-1/2 shadow-lg"
            style={{ 
              left: `${currentPrice ? ((currentPrice.price - low24h) / (high24h - low24h)) * 100 : 50}%` 
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

export default ChartPriceDetails;
