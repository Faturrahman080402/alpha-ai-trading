import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const AIPredictions = () => {
  const predictions = [
    {
      symbol: "BTC/USDT",
      prediction: "LONG",
      confidence: 87,
      timeframe: "1H",
      target: "+2.5%",
    },
    {
      symbol: "ETH/USDT",
      prediction: "SHORT",
      confidence: 72,
      timeframe: "4H",
      target: "-1.8%",
    },
    {
      symbol: "SOL/USDT",
      prediction: "NEUTRAL",
      confidence: 54,
      timeframe: "1D",
      target: "±0.5%",
    },
  ];

  const getIcon = (prediction: string) => {
    switch (prediction) {
      case "LONG":
        return <TrendingUp className="w-4 h-4" />;
      case "SHORT":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getColor = (prediction: string) => {
    switch (prediction) {
      case "LONG":
        return "text-success border-success/50 bg-success/10";
      case "SHORT":
        return "text-danger border-danger/50 bg-danger/10";
      default:
        return "text-muted-foreground border-muted bg-muted/10";
    }
  };

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
        {predictions.map((pred, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold font-mono">{pred.symbol}</p>
                <p className="text-xs text-muted-foreground">{pred.timeframe} Timeframe</p>
              </div>
              <Badge variant="outline" className={getColor(pred.prediction)}>
                {getIcon(pred.prediction)}
                <span className="ml-1">{pred.prediction}</span>
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-mono font-semibold">{pred.confidence}%</span>
              </div>
              <Progress value={pred.confidence} className="h-2" />
              
              <div className="flex items-center justify-between text-sm pt-2">
                <span className="text-muted-foreground">Target</span>
                <span className="font-mono font-semibold">{pred.target}</span>
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
