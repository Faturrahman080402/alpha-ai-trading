import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wifi, WifiOff } from "lucide-react";
import { useLivePrices } from "@/hooks/useLivePrices";

interface MarketOverviewProps {
  onSelectAsset: (symbol: string) => void;
}

const MarketOverview = ({ onSelectAsset }: MarketOverviewProps) => {
  const { prices, isConnected } = useLivePrices();

  const markets = Object.values(prices).map((p) => ({
    symbol: p.symbol,
    name: p.symbol.split("/")[0],
    price: p.price,
    change: p.change,
    volume: p.volume,
  }));

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Market Overview</h3>
        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <Wifi className="w-3.5 h-3.5 text-success" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-danger" />
          )}
          <span className="text-xs text-muted-foreground">
            {isConnected ? "Live" : "Offline"}
          </span>
        </div>
      </div>
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
