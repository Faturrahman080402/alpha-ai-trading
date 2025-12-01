import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketOverviewProps {
  onSelectAsset: (symbol: string) => void;
}

const MarketOverview = ({ onSelectAsset }: MarketOverviewProps) => {
  const markets = [
    { symbol: "BTCUSDT", name: "Bitcoin", price: 43284.50, change: 2.45, volume: "28.5B" },
    { symbol: "ETHUSDT", name: "Ethereum", price: 2298.45, change: 1.82, volume: "14.2B" },
    { symbol: "BNBUSDT", name: "BNB", price: 312.85, change: -0.54, volume: "1.8B" },
    { symbol: "SOLUSDT", name: "Solana", price: 99.20, change: 4.12, volume: "2.1B" },
  ];

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold mb-4">Market Overview</h3>
      <div className="space-y-3">
        {markets.map((market) => (
          <button
            key={market.symbol}
            onClick={() => onSelectAsset(market.symbol)}
            className="w-full p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{market.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{market.symbol}</p>
              </div>
              <div className="text-right">
                <p className="font-mono font-semibold">${market.price.toLocaleString()}</p>
                <p
                  className={`text-xs font-mono flex items-center justify-end gap-1 ${
                    market.change >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {market.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {market.change >= 0 ? "+" : ""}{market.change}%
                </p>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Volume: ${market.volume}
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default MarketOverview;
