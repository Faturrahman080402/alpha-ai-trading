import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Brain, Zap, Shield, BarChart3, Wallet, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import PriceChart from "@/components/trading/PriceChart";
import PortfolioOverview from "@/components/trading/PortfolioOverview";
import AIPredictions from "@/components/trading/AIPredictions";
import ActiveTrades from "@/components/trading/ActiveTrades";
import MarketOverview from "@/components/trading/MarketOverview";
import QuickTrade from "@/components/trading/QuickTrade";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useProfile } from "@/hooks/useProfile";
import { useRealtimeTrades } from "@/hooks/useRealtimeTrades";
import { useLivePrices } from "@/hooks/useLivePrices";

const Index = () => {
  const [selectedAsset, setSelectedAsset] = useState("BTC/USDT");
  const { user, signOut } = useAuth();
  const { data: portfolio } = usePortfolio();
  const { data: profile } = useProfile();
  const { getPrice } = useLivePrices();
  
  // Enable realtime trade updates
  useRealtimeTrades();

  const isDemo = profile?.trading_mode === "demo";
  const balance = isDemo ? portfolio?.demo_balance : portfolio?.balance;
  const currentPrice = getPrice(selectedAsset);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">AI Trading Platform</h1>
                  <p className="text-xs text-muted-foreground">Intelligent Trading System</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
                AI Active
              </Badge>
              {user ? (
                <>
                  {isDemo && <Badge variant="secondary">Demo Mode</Badge>}
                  <Button variant="outline" size="sm">
                    <Wallet className="w-4 h-4 mr-2" />
                    ${(balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button asChild size="sm">
                  <Link to="/auth">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Portfolio & AI */}
          <div className="lg:col-span-3 space-y-6">
            <PortfolioOverview />
            <AIPredictions />
          </div>

          {/* Center Column - Chart & Trading */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold font-mono">{selectedAsset}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedAsset === "BTC/USDT" ? "Bitcoin / Tether" : 
                     selectedAsset === "ETH/USDT" ? "Ethereum / Tether" :
                     selectedAsset === "SOL/USDT" ? "Solana / Tether" :
                     selectedAsset === "BNB/USDT" ? "BNB / Tether" :
                     selectedAsset === "XRP/USDT" ? "XRP / Tether" : selectedAsset}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold font-mono ${currentPrice && currentPrice.change >= 0 ? "text-success" : "text-danger"}`}>
                    ${currentPrice?.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "—"}
                  </p>
                  <p className={`text-sm flex items-center justify-end gap-1 ${currentPrice && currentPrice.change >= 0 ? "text-success" : "text-danger"}`}>
                    <TrendingUp className="w-4 h-4" />
                    {currentPrice ? `${currentPrice.change >= 0 ? "+" : ""}${currentPrice.change.toFixed(2)}%` : "—"}
                  </p>
                </div>
              </div>
              <PriceChart symbol={selectedAsset} />
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <QuickTrade symbol={selectedAsset} />
              <MarketOverview onSelectAsset={setSelectedAsset} />
            </div>
          </div>

          {/* Right Column - Active Trades */}
          <div className="lg:col-span-3">
            <ActiveTrades />
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-purple-600/10 border-primary/20">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">AI-Powered Predictions</h3>
            <p className="text-sm text-muted-foreground">
              Advanced LSTM & transformer models for accurate market forecasting
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-success/10 to-emerald-600/10 border-success/20">
            <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-semibold mb-2">Automated Trading</h3>
            <p className="text-sm text-muted-foreground">
              Execute trades automatically based on AI signals with risk management
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-danger/10 to-red-600/10 border-danger/20">
            <div className="w-12 h-12 rounded-lg bg-danger/20 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-danger" />
            </div>
            <h3 className="font-semibold mb-2">Risk Management</h3>
            <p className="text-sm text-muted-foreground">
              Built-in stop-loss, take-profit, and position sizing algorithms
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-600/10 border-yellow-500/20">
            <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="font-semibold mb-2">Real-time Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Live performance tracking with comprehensive trading analytics
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
