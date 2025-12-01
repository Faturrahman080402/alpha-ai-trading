import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PortfolioOverview = () => {
  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Portfolio</h3>
        <Badge variant="outline" className="text-success border-success/50">
          +15.8%
        </Badge>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
          <p className="text-3xl font-bold font-mono">$124,580.50</p>
          <p className="text-sm text-success mt-1 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +$19,240.32 Today
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Available</p>
            <p className="text-lg font-bold font-mono">$45,230.12</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">In Positions</p>
            <p className="text-lg font-bold font-mono">$79,350.38</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border space-y-3">
          <h4 className="text-sm font-semibold">Today's Performance</h4>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-sm">Winning Trades</span>
            </div>
            <span className="font-mono text-sm">12</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-danger" />
              <span className="text-sm">Losing Trades</span>
            </div>
            <span className="font-mono text-sm">3</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Win Rate</span>
            </div>
            <span className="font-mono text-sm font-semibold text-success">80%</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PortfolioOverview;
