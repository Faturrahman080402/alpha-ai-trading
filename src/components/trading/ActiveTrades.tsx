import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, X } from "lucide-react";

const ActiveTrades = () => {
  const trades = [
    {
      id: 1,
      symbol: "BTC/USDT",
      side: "LONG",
      entry: 42150.30,
      current: 43284.50,
      quantity: 0.5,
      pnl: 567.10,
      pnlPercent: 2.69,
      stopLoss: 41500,
      takeProfit: 44000,
    },
    {
      id: 2,
      symbol: "ETH/USDT",
      side: "LONG",
      entry: 2245.80,
      current: 2298.45,
      quantity: 5,
      pnl: 263.25,
      pnlPercent: 2.34,
      stopLoss: 2200,
      takeProfit: 2400,
    },
    {
      id: 3,
      symbol: "SOL/USDT",
      side: "SHORT",
      entry: 98.50,
      current: 99.20,
      quantity: 100,
      pnl: -70.00,
      pnlPercent: -0.71,
      stopLoss: 100,
      takeProfit: 95,
    },
  ];

  return (
    <Card className="p-6 bg-card border-border h-fit sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Active Trades</h3>
        <Badge variant="outline">{trades.length} Open</Badge>
      </div>

      <div className="space-y-3">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className={`p-4 rounded-lg border ${
              trade.pnl >= 0
                ? "bg-success/5 border-success/20"
                : "bg-danger/5 border-danger/20"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold font-mono text-sm">{trade.symbol}</p>
                <Badge
                  variant="outline"
                  className={`mt-1 text-xs ${
                    trade.side === "LONG"
                      ? "text-success border-success/50"
                      : "text-danger border-danger/50"
                  }`}
                >
                  {trade.side === "LONG" ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {trade.side}
                </Badge>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-bold font-mono ${
                    trade.pnl >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                </p>
                <p
                  className={`text-xs font-mono ${
                    trade.pnl >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {trade.pnl >= 0 ? "+" : ""}{trade.pnlPercent.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entry:</span>
                <span className="font-mono">${trade.entry.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current:</span>
                <span className="font-mono">${trade.current.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-mono">{trade.quantity}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-border">
                <span className="text-muted-foreground">SL:</span>
                <span className="font-mono text-danger">${trade.stopLoss}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">TP:</span>
                <span className="font-mono text-success">${trade.takeProfit}</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3 text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Close Position
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total P&L:</span>
          <span className="font-mono font-bold text-success">+$760.35</span>
        </div>
      </div>
    </Card>
  );
};

export default ActiveTrades;
