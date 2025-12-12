import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateTrade } from "@/hooks/useTrades";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";

// Simulated prices - in real app, these would come from a market data API
const currentPrices: Record<string, number> = {
  "BTC/USDT": 43284.50,
  "ETH/USDT": 2298.45,
  "SOL/USDT": 99.20,
  "BNB/USDT": 312.80,
  "XRP/USDT": 0.62,
};

interface QuickTradeProps {
  symbol?: string;
}

const QuickTrade = ({ symbol = "BTC/USDT" }: QuickTradeProps) => {
  const [amount, setAmount] = useState("1000");
  const [leverage, setLeverage] = useState("5");
  const [limitPrice, setLimitPrice] = useState("");
  
  const { user } = useAuth();
  const { data: portfolio } = usePortfolio();
  const { data: profile } = useProfile();
  const createTrade = useCreateTrade();

  const isDemo = profile?.trading_mode === "demo";
  const currentPrice = currentPrices[symbol] ?? 43284.50;

  const handleTrade = async (side: "buy" | "sell") => {
    if (!user) {
      toast.error("Please sign in to trade");
      return;
    }

    if (!portfolio) {
      toast.error("Portfolio not found");
      return;
    }

    const tradeAmount = parseFloat(amount);
    const currentBalance = isDemo ? portfolio.demo_balance : portfolio.balance;

    if (tradeAmount > currentBalance) {
      toast.error("Insufficient balance", { description: `Available: $${currentBalance.toLocaleString()}` });
      return;
    }

    const positionSize = tradeAmount * parseFloat(leverage);
    const quantity = positionSize / currentPrice;

    try {
      await createTrade.mutateAsync({
        portfolio_id: portfolio.id,
        symbol,
        trade_type: side,
        entry_price: currentPrice,
        quantity,
        amount: tradeAmount,
        is_demo: isDemo,
      });
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const positionSize = parseFloat(amount || "0") * parseFloat(leverage || "1");
  const estimatedFee = parseFloat(amount || "0") * 0.001;

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-secondary/20 border-border">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Quick Trade</h3>
        <span className="text-sm text-muted-foreground ml-auto font-mono">{symbol}</span>
      </div>

      {!user ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Sign in to start trading</p>
        </div>
      ) : (
        <Tabs defaultValue="market" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="limit">Limit</TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="space-y-4">
            <div>
              <Label htmlFor="amount" className="text-sm">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 font-mono"
              />
            </div>

            <div>
              <Label htmlFor="leverage" className="text-sm">Leverage</Label>
              <div className="flex gap-2 mt-1">
                {["1", "2", "5", "10", "20"].map((lev) => (
                  <Button
                    key={lev}
                    variant={leverage === lev ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLeverage(lev)}
                    className="flex-1"
                  >
                    {lev}x
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                onClick={() => handleTrade("buy")}
                className="bg-success hover:bg-success/90 text-white"
                disabled={createTrade.isPending}
              >
                {createTrade.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="w-4 h-4 mr-2" />
                )}
                Long
              </Button>
              <Button
                onClick={() => handleTrade("sell")}
                className="bg-danger hover:bg-danger/90 text-white"
                disabled={createTrade.isPending}
              >
                {createTrade.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-2" />
                )}
                Short
              </Button>
            </div>

            <div className="pt-3 border-t border-border text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Current Price:</span>
                <span className="font-mono">${currentPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Position Size:</span>
                <span className="font-mono">${positionSize.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Est. Fee:</span>
                <span className="font-mono">${estimatedFee.toFixed(2)}</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="limit" className="space-y-4">
            <div>
              <Label htmlFor="limit-price" className="text-sm">Limit Price</Label>
              <Input
                id="limit-price"
                type="number"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                placeholder={currentPrice.toString()}
                className="mt-1 font-mono"
              />
            </div>

            <div>
              <Label htmlFor="limit-amount" className="text-sm">Amount (USD)</Label>
              <Input
                id="limit-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                onClick={() => handleTrade("buy")}
                className="bg-success hover:bg-success/90 text-white"
                disabled={createTrade.isPending}
              >
                {createTrade.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="w-4 h-4 mr-2" />
                )}
                Buy
              </Button>
              <Button
                onClick={() => handleTrade("sell")}
                className="bg-danger hover:bg-danger/90 text-white"
                disabled={createTrade.isPending}
              >
                {createTrade.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-2" />
                )}
                Sell
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </Card>
  );
};

export default QuickTrade;
