import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";
import { toast } from "sonner";

const QuickTrade = () => {
  const [amount, setAmount] = useState("1000");
  const [leverage, setLeverage] = useState("5");

  const handleTrade = (side: "LONG" | "SHORT") => {
    toast.success(
      `${side} order placed!`,
      {
        description: `$${amount} at ${leverage}x leverage`,
      }
    );
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-secondary/20 border-border">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Quick Trade</h3>
      </div>

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
              onClick={() => handleTrade("LONG")}
              className="bg-success hover:bg-success/90 text-white"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Long
            </Button>
            <Button
              onClick={() => handleTrade("SHORT")}
              className="bg-danger hover:bg-danger/90 text-white"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Short
            </Button>
          </div>

          <div className="pt-3 border-t border-border text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Position Size:</span>
              <span className="font-mono">${(parseFloat(amount) * parseFloat(leverage)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Est. Fee:</span>
              <span className="font-mono">${(parseFloat(amount) * 0.001).toFixed(2)}</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="limit" className="space-y-4">
          <div>
            <Label htmlFor="limit-price" className="text-sm">Limit Price</Label>
            <Input
              id="limit-price"
              type="number"
              placeholder="43,000"
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
              onClick={() => handleTrade("LONG")}
              className="bg-success hover:bg-success/90 text-white"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Buy
            </Button>
            <Button
              onClick={() => handleTrade("SHORT")}
              className="bg-danger hover:bg-danger/90 text-white"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Sell
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default QuickTrade;
