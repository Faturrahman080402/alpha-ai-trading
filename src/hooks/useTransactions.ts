import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Transaction {
  id: string;
  user_id: string;
  type: "deposit" | "withdrawal";
  amount: number;
  method: string;
  status: "pending" | "processing" | "success" | "failed";
  is_demo: boolean;
  reference_id: string | null;
  created_at: string;
  completed_at: string | null;
}

export const useTransactions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });
};

export const useDeposit = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      amount, 
      isDemo, 
      portfolioId 
    }: { 
      amount: number; 
      isDemo: boolean; 
      portfolioId: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      
      const referenceId = `DANA-DEP-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
      
      // Create transaction record
      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          type: "deposit",
          amount,
          method: "DANA",
          status: "processing",
          is_demo: isDemo,
          reference_id: referenceId,
        })
        .select()
        .single();

      if (txError) throw txError;

      // Simulate payment gateway processing (mock)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update portfolio balance
      const balanceField = isDemo ? "demo_balance" : "balance";
      const { data: portfolio, error: getError } = await supabase
        .from("portfolios")
        .select(balanceField)
        .eq("id", portfolioId)
        .single();

      if (getError) throw getError;

      const currentBalance = Number(portfolio[balanceField]) || 0;
      const newBalance = currentBalance + amount;

      const { error: updateError } = await supabase
        .from("portfolios")
        .update({ [balanceField]: newBalance })
        .eq("id", portfolioId);

      if (updateError) throw updateError;

      // Mark transaction as success
      const { error: txUpdateError } = await supabase
        .from("transactions")
        .update({ 
          status: "success",
          completed_at: new Date().toISOString()
        })
        .eq("id", transaction.id);

      if (txUpdateError) throw txUpdateError;

      return { transaction, newBalance };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      toast({
        title: "Deposit Successful",
        description: `$${data.transaction.amount.toLocaleString()} has been added to your account via DANA.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Deposit Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useWithdraw = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      amount, 
      isDemo, 
      portfolioId,
      currentBalance
    }: { 
      amount: number; 
      isDemo: boolean; 
      portfolioId: string;
      currentBalance: number;
    }) => {
      if (!user) throw new Error("Not authenticated");
      if (amount > currentBalance) throw new Error("Insufficient balance");
      if (amount < 10) throw new Error("Minimum withdrawal is $10");
      
      const referenceId = `DANA-WTH-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
      
      // Create transaction record
      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          type: "withdrawal",
          amount,
          method: "DANA",
          status: "processing",
          is_demo: isDemo,
          reference_id: referenceId,
        })
        .select()
        .single();

      if (txError) throw txError;

      // Simulate payment gateway processing (mock)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update portfolio balance
      const balanceField = isDemo ? "demo_balance" : "balance";
      const newBalance = currentBalance - amount;

      const { error: updateError } = await supabase
        .from("portfolios")
        .update({ [balanceField]: newBalance })
        .eq("id", portfolioId);

      if (updateError) throw updateError;

      // Mark transaction as success
      const { error: txUpdateError } = await supabase
        .from("transactions")
        .update({ 
          status: "success",
          completed_at: new Date().toISOString()
        })
        .eq("id", transaction.id);

      if (txUpdateError) throw txUpdateError;

      return { transaction, newBalance };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      toast({
        title: "Withdrawal Successful",
        description: `$${data.transaction.amount.toLocaleString()} has been sent to your DANA wallet.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
