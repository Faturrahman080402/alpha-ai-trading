import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useProfile } from "@/hooks/useProfile";
import { useActiveTrades } from "@/hooks/useTrades";
import { useAuth } from "@/hooks/useAuth";

const PortfolioOverview = () => {
  const { user } = useAuth();
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolio();
  const { data: profile } = useProfile();
  const { data: trades } = useActiveTrades();

  const isDemo = profile?.trading_mode === "demo";
  const balance = isDemo ? portfolio?.demo_balance : portfolio?.balance;
  const totalProfitLoss = portfolio?.total_profit_loss ?? 0;
  const profitPercent = balance && balance > 0 ? ((totalProfitLoss / balance) * 100) : 0;

  // Calculate positions value from active trades
  const positionsValue = trades?.reduce((sum, trade) => {
    return sum + (Number(trade.entry_price) * Number(trade.quantity));
  }, 0) ?? 0;

  const availableBalance = (balance ?? 0) - positionsValue;

  // Calculate winning/losing trades
  const winningTrades = trades?.filter(t => (t.profit_loss ?? 0) > 0).length ?? 0;
  const losingTrades = trades?.filter(t => (t.profit_loss ?? 0) < 0).length ?? 0;
  const totalTrades = winningTrades + losingTrades;
  const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;

  if (!user) {
    return (
      <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Sign in to view your portfolio</p>
        </div>
      </Card>
    );
  }

  if (portfolioLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="space-y-4">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="h-20 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Portfolio</h3>
        <Badge variant="outline" className={totalProfitLoss >= 0 ? "text-success border-success/50" : "text-danger border-danger/50"}>
          {totalProfitLoss >= 0 ? "+" : ""}{profitPercent.toFixed(1)}%
        </Badge>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm text-muted-foreground">Total Balance</p>
            {isDemo && <Badge variant="secondary" className="text-xs">Demo</Badge>}
          </div>
          <p className="text-3xl font-bold font-mono">${(balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className={`text-sm mt-1 flex items-center gap-1 ${totalProfitLoss >= 0 ? "text-success" : "text-danger"}`}>
            {totalProfitLoss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {totalProfitLoss >= 0 ? "+" : ""}${Math.abs(totalProfitLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Total P&L
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Available</p>
            <p className="text-lg font-bold font-mono">${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">In Positions</p>
            <p className="text-lg font-bold font-mono">${positionsValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border space-y-3">
          <h4 className="text-sm font-semibold">Performance</h4>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-sm">Winning Trades</span>
            </div>
            <span className="font-mono text-sm">{winningTrades}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-danger" />
              <span className="text-sm">Losing Trades</span>
            </div>
            <span className="font-mono text-sm">{losingTrades}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Win Rate</span>
            </div>
            <span className={`font-mono text-sm font-semibold ${winRate >= 50 ? "text-success" : "text-danger"}`}>{winRate}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PortfolioOverview;
