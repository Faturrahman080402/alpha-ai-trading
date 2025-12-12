import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useActiveTrades, Trade, useCloseTrade } from "@/hooks/useTrades";
import { useLivePrices } from "@/hooks/useLivePrices";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useTradeExpiration = () => {
  const { user } = useAuth();
  const { data: trades } = useActiveTrades();
  const closeTrade = useCloseTrade();
  const { prices } = useLivePrices();
  const queryClient = useQueryClient();
  const processedTrades = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!trades || !user) return;

    const checkExpirations = () => {
      const now = new Date();

      trades.forEach((trade) => {
        // Skip if no expiration set or already processed
        if (!trade.expires_at || processedTrades.current.has(trade.id)) return;

        const expiresAt = new Date(trade.expires_at);
        
        if (now >= expiresAt) {
          // Mark as processed to avoid duplicate closes
          processedTrades.current.add(trade.id);
          
          // Get current price
          const currentPrice = prices[trade.symbol]?.price ?? Number(trade.entry_price);
          const multiplier = trade.trade_type === "buy" ? 1 : -1;
          const profitLoss = (currentPrice - Number(trade.entry_price)) * Number(trade.quantity) * multiplier;
          const entryAmount = Number(trade.entry_price) * Number(trade.quantity);

          // Close the trade
          closeTrade.mutate(
            {
              tradeId: trade.id,
              exitPrice: currentPrice,
              profitLoss,
              portfolioId: trade.portfolio_id,
              isDemo: trade.is_demo,
              entryAmount,
            },
            {
              onSuccess: () => {
                const isProfit = profitLoss >= 0;
                toast[isProfit ? "success" : "error"](
                  `Order Duration Ended: ${trade.symbol}`,
                  {
                    description: `Position closed with ${isProfit ? "profit" : "loss"}: ${isProfit ? "+" : ""}$${profitLoss.toFixed(2)}`,
                    duration: 8000,
                  }
                );
              },
              onError: () => {
                // Remove from processed so it can retry
                processedTrades.current.delete(trade.id);
              },
            }
          );
        }
      });
    };

    // Check immediately
    checkExpirations();

    // Check every second
    const interval = setInterval(checkExpirations, 1000);

    return () => clearInterval(interval);
  }, [trades, user, prices, closeTrade]);

  // Clean up processed trades when they're no longer in the active list
  useEffect(() => {
    if (!trades) return;
    const activeIds = new Set(trades.map((t) => t.id));
    processedTrades.current.forEach((id) => {
      if (!activeIds.has(id)) {
        processedTrades.current.delete(id);
      }
    });
  }, [trades]);
};
