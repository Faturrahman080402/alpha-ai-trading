import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Trade {
  id: string;
  user_id: string;
  portfolio_id: string;
  symbol: string;
  trade_type: "buy" | "sell";
  status: "pending" | "active" | "completed" | "cancelled";
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  stop_loss: number | null;
  take_profit: number | null;
  profit_loss: number | null;
  is_demo: boolean;
  ai_recommended: boolean;
  created_at: string;
  closed_at: string | null;
}

export const useActiveTrades = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["trades", "active", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["pending", "active"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Trade[];
    },
    enabled: !!user,
  });
};

export const useCreateTrade = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (trade: {
      portfolio_id: string;
      symbol: string;
      trade_type: "buy" | "sell";
      entry_price: number;
      quantity: number;
      amount: number;
      stop_loss?: number;
      take_profit?: number;
      is_demo: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // First, get the current portfolio balance
      const { data: portfolio, error: portfolioError } = await supabase
        .from("portfolios")
        .select("*")
        .eq("id", trade.portfolio_id)
        .single();

      if (portfolioError) throw portfolioError;

      const currentBalance = trade.is_demo ? portfolio.demo_balance : portfolio.balance;
      
      if (trade.amount > currentBalance) {
        throw new Error("Insufficient balance");
      }

      // Create the trade
      const { data, error } = await supabase
        .from("trades")
        .insert({
          user_id: user.id,
          portfolio_id: trade.portfolio_id,
          symbol: trade.symbol,
          trade_type: trade.trade_type,
          status: "active",
          entry_price: trade.entry_price,
          quantity: trade.quantity,
          stop_loss: trade.stop_loss,
          take_profit: trade.take_profit,
          is_demo: trade.is_demo,
        })
        .select()
        .single();

      if (error) throw error;

      // Deduct the amount from the portfolio balance
      const newBalance = currentBalance - trade.amount;
      const updateField = trade.is_demo ? { demo_balance: newBalance } : { balance: newBalance };
      
      const { error: updateError } = await supabase
        .from("portfolios")
        .update(updateField)
        .eq("id", trade.portfolio_id);

      if (updateError) throw updateError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades", "active", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["portfolio", user?.id] });
      toast.success("Trade opened successfully!");
    },
    onError: (error) => {
      toast.error("Failed to open trade", { description: error.message });
    },
  });
};

export const useCloseTrade = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ tradeId, exitPrice, profitLoss, portfolioId, isDemo, entryAmount }: { 
      tradeId: string; 
      exitPrice: number; 
      profitLoss: number;
      portfolioId: string;
      isDemo: boolean;
      entryAmount: number;
    }) => {
      // First, get the current portfolio balance
      const { data: portfolio, error: portfolioError } = await supabase
        .from("portfolios")
        .select("*")
        .eq("id", portfolioId)
        .single();

      if (portfolioError) throw portfolioError;

      // Close the trade
      const { data, error } = await supabase
        .from("trades")
        .update({
          status: "completed",
          exit_price: exitPrice,
          profit_loss: profitLoss,
          closed_at: new Date().toISOString(),
        })
        .eq("id", tradeId)
        .select()
        .single();

      if (error) throw error;

      // Add back the original amount plus profit/loss to the portfolio
      const currentBalance = isDemo ? portfolio.demo_balance : portfolio.balance;
      const newBalance = currentBalance + entryAmount + profitLoss;
      const updateField = isDemo ? { demo_balance: newBalance } : { balance: newBalance };
      
      // Also update total_profit_loss
      const { error: updateError } = await supabase
        .from("portfolios")
        .update({
          ...updateField,
          total_profit_loss: portfolio.total_profit_loss + profitLoss,
        })
        .eq("id", portfolioId);

      if (updateError) throw updateError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades", "active", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["portfolio", user?.id] });
      toast.success("Trade closed successfully!");
    },
    onError: (error) => {
      toast.error("Failed to close trade", { description: error.message });
    },
  });
};
