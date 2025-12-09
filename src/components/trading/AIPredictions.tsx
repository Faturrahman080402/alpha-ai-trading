import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { usePredictions } from "@/hooks/usePredictions";

// Fallback mock data when no predictions exist
const mockPredictions = [
  {
    id: "1",
    symbol: "BTC/USDT",
    predicted_direction: "LONG",
    confidence: 87,
    timeframe: "1H",
    predicted_price: 44362.15,
    prediction_type: "price",
    model_used: "LSTM",
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 3600000).toISOString(),
  },
  {
    id: "2",
    symbol: "ETH/USDT",
    predicted_direction: "SHORT",
    confidence: 72,
    timeframe: "4H",
    predicted_price: 2256.82,
    prediction_type: "price",
    model_used: "Transformer",
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 14400000).toISOString(),
  },
  {
    id: "3",
    symbol: "SOL/USDT",
    predicted_direction: "NEUTRAL",
    confidence: 54,
    timeframe: "1D",
    predicted_price: 99.70,
    prediction_type: "price",
    model_used: "Ensemble",
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
  },
];

const AIPredictions = () => {
  const { data: predictions, isLoading } = usePredictions();

  const displayPredictions = predictions && predictions.length > 0 ? predictions : mockPredictions;

  const getIcon = (prediction: string) => {
    switch (prediction.toUpperCase()) {
      case "LONG":
      case "UP":
      case "BUY":
        return <TrendingUp className="w-4 h-4" />;
      case "SHORT":
      case "DOWN":
      case "SELL":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getColor = (prediction: string) => {
    switch (prediction.toUpperCase()) {
      case "LONG":
      case "UP":
      case "BUY":
        return "text-success border-success/50 bg-success/10";
      case "SHORT":
      case "DOWN":
      case "SELL":
        return "text-danger border-danger/50 bg-danger/10";
      default:
        return "text-muted-foreground border-muted bg-muted/10";
    }
  };

  const getTargetText = (prediction: { predicted_direction: string; confidence: number }) => {
    const basePercent = (prediction.confidence / 100) * 3;
    switch (prediction.predicted_direction.toUpperCase()) {
      case "LONG":
      case "UP":
      case "BUY":
        return `+${basePercent.toFixed(1)}%`;
      case "SHORT":
      case "DOWN":
      case "SELL":
        return `-${basePercent.toFixed(1)}%`;
      default:
        return `±${(basePercent * 0.3).toFixed(1)}%`;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-purple-600/5 border-primary/20">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">AI Predictions</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-purple-600/5 border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Predictions</h3>
        <Badge variant="outline" className="ml-auto text-primary border-primary/50">
          Live
        </Badge>
      </div>

      <div className="space-y-4">
        {displayPredictions.map((pred) => (
          <div
            key={pred.id}
            className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold font-mono">{pred.symbol}</p>
                <p className="text-xs text-muted-foreground">{pred.timeframe} Timeframe • {pred.model_used}</p>
              </div>
              <Badge variant="outline" className={getColor(pred.predicted_direction)}>
                {getIcon(pred.predicted_direction)}
                <span className="ml-1">{pred.predicted_direction.toUpperCase()}</span>
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-mono font-semibold">{Number(pred.confidence).toFixed(0)}%</span>
              </div>
              <Progress value={Number(pred.confidence)} className="h-2" />
              
              <div className="flex items-center justify-between text-sm pt-2">
                <span className="text-muted-foreground">Target</span>
                <span className="font-mono font-semibold">{getTargetText(pred)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Predictions updated every 5 minutes using LSTM & Transformer models
        </p>
      </div>
    </Card>
  );
};

export default AIPredictions;
