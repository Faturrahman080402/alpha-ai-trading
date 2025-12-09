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
      stop_loss?: number;
      take_profit?: number;
      is_demo: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");

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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades", "active", user?.id] });
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
    mutationFn: async ({ tradeId, exitPrice, profitLoss }: { tradeId: string; exitPrice: number; profitLoss: number }) => {
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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades", "active", user?.id] });
      toast.success("Trade closed successfully!");
    },
    onError: (error) => {
      toast.error("Failed to close trade", { description: error.message });
    },
  });
};
