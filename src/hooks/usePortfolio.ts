import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  demo_balance: number;
  total_profit_loss: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const usePortfolio = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["portfolio", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_default", true)
        .maybeSingle();

      if (error) throw error;
      return data as Portfolio | null;
    },
    enabled: !!user,
  });
};

export const useUpdatePortfolioBalance = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ portfolioId, balance, demoBalance }: { portfolioId: string; balance?: number; demoBalance?: number }) => {
      const updates: Partial<Portfolio> = {};
      if (balance !== undefined) updates.balance = balance;
      if (demoBalance !== undefined) updates.demo_balance = demoBalance;

      const { data, error } = await supabase
        .from("portfolios")
        .update(updates)
        .eq("id", portfolioId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", user?.id] });
    },
  });
};
