import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, X, Loader2, Wifi } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveTrades, useCloseTrade, Trade } from "@/hooks/useTrades";
import { useAuth } from "@/hooks/useAuth";
import { useLivePrices } from "@/hooks/useLivePrices";
import { useState } from "react";

const ActiveTrades = () => {
  const { user } = useAuth();
  const { data: trades, isLoading } = useActiveTrades();
  const closeTrade = useCloseTrade();
  const [closingTradeId, setClosingTradeId] = useState<string | null>(null);
  const { prices, isConnected } = useLivePrices();

  const handleCloseTrade = async (trade: Trade) => {
    setClosingTradeId(trade.id);
    const currentPrice = prices[trade.symbol]?.price ?? Number(trade.entry_price);
    const multiplier = trade.trade_type === "buy" ? 1 : -1;
    const profitLoss = (currentPrice - Number(trade.entry_price)) * Number(trade.quantity) * multiplier;

    try {
      await closeTrade.mutateAsync({
        tradeId: trade.id,
        exitPrice: currentPrice,
        profitLoss,
      });
    } finally {
      setClosingTradeId(null);
    }
  };

  const calculatePnL = (trade: Trade) => {
    const currentPrice = prices[trade.symbol]?.price ?? Number(trade.entry_price);
    const multiplier = trade.trade_type === "buy" ? 1 : -1;
    const pnl = (currentPrice - Number(trade.entry_price)) * Number(trade.quantity) * multiplier;
    const pnlPercent = (pnl / (Number(trade.entry_price) * Number(trade.quantity))) * 100;
    return { pnl, pnlPercent, currentPrice };
  };

  if (!user) {
    return (
      <Card className="p-6 bg-card border-border h-fit sticky top-24">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Sign in to view trades</p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6 bg-card border-border h-fit sticky top-24">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  const activeTrades = trades ?? [];
  const totalPnL = activeTrades.reduce((sum, trade) => {
    const { pnl } = calculatePnL(trade);
    return sum + pnl;
  }, 0);

  return (
    <Card className="p-6 bg-card border-border h-fit sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Active Trades</h3>
          {isConnected && <Wifi className="w-3.5 h-3.5 text-success" />}
        </div>
        <Badge variant="outline">{activeTrades.length} Open</Badge>
      </div>

      {activeTrades.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No active trades</p>
          <p className="text-sm text-muted-foreground mt-1">Use Quick Trade to open a position</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeTrades.map((trade) => {
            const { pnl, pnlPercent, currentPrice } = calculatePnL(trade);
            const side = trade.trade_type === "buy" ? "LONG" : "SHORT";

            return (
              <div
                key={trade.id}
                className={`p-4 rounded-lg border ${
                  pnl >= 0
                    ? "bg-success/5 border-success/20"
                    : "bg-danger/5 border-danger/20"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold font-mono text-sm">{trade.symbol}</p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`mt-1 text-xs ${
                          side === "LONG"
                            ? "text-success border-success/50"
                            : "text-danger border-danger/50"
                        }`}
                      >
                        {side === "LONG" ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {side}
                      </Badge>
                      {trade.is_demo && <Badge variant="secondary" className="text-xs">Demo</Badge>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold font-mono ${
                        pnl >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                    </p>
                    <p
                      className={`text-xs font-mono ${
                        pnl >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {pnl >= 0 ? "+" : ""}{pnlPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entry:</span>
                    <span className="font-mono">${Number(trade.entry_price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current:</span>
                    <span className="font-mono">${currentPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-mono">{Number(trade.quantity)}</span>
                  </div>
                  {trade.stop_loss && (
                    <div className="flex justify-between pt-1 border-t border-border">
                      <span className="text-muted-foreground">SL:</span>
                      <span className="font-mono text-danger">${Number(trade.stop_loss)}</span>
                    </div>
                  )}
                  {trade.take_profit && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">TP:</span>
                      <span className="font-mono text-success">${Number(trade.take_profit)}</span>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 text-xs"
                  onClick={() => handleCloseTrade(trade)}
                  disabled={closingTradeId === trade.id}
                >
                  {closingTradeId === trade.id ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <X className="w-3 h-3 mr-1" />
                  )}
                  Close Position
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {activeTrades.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total P&L:</span>
            <span className={`font-mono font-bold ${totalPnL >= 0 ? "text-success" : "text-danger"}`}>
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ActiveTrades;
