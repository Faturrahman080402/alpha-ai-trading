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

// Mock deposit for demo accounts
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
      
      // Demo mode uses mock deposit
      if (isDemo) {
        const referenceId = `DEMO-DEP-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
        
        const { data: transaction, error: txError } = await supabase
          .from("transactions")
          .insert({
            user_id: user.id,
            type: "deposit",
            amount,
            method: "DANA",
            status: "processing",
            is_demo: true,
            reference_id: referenceId,
          })
          .select()
          .single();

        if (txError) throw txError;

        await new Promise(resolve => setTimeout(resolve, 1500));

        const { data: portfolio, error: getError } = await supabase
          .from("portfolios")
          .select("demo_balance")
          .eq("id", portfolioId)
          .single();

        if (getError) throw getError;

        const currentBalance = Number(portfolio.demo_balance) || 0;
        const newBalance = currentBalance + amount;

        const { error: updateError } = await supabase
          .from("portfolios")
          .update({ demo_balance: newBalance })
          .eq("id", portfolioId);

        if (updateError) throw updateError;

        const { error: txUpdateError } = await supabase
          .from("transactions")
          .update({ 
            status: "success",
            completed_at: new Date().toISOString()
          })
          .eq("id", transaction.id);

        if (txUpdateError) throw txUpdateError;

        return { transaction, newBalance, isDemo: true };
      }
      
      // Real mode - handled by Midtrans in WalletManager
      throw new Error("Real deposits should use Midtrans flow");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      toast({
        title: "Deposit Successful",
        description: `$${data.transaction.amount.toLocaleString()} has been added to your demo account.`,
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

// Real deposit using Midtrans
export const useMidtransDeposit = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      amount, 
      portfolioId 
    }: { 
      amount: number; 
      portfolioId: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('midtrans-create-transaction', {
        body: {
          amount,
          type: 'deposit',
          portfolioId,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    onError: (error) => {
      toast({
        title: "Payment Error",
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
      
      const referenceId = `${isDemo ? 'DEMO' : 'DANA'}-WTH-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
      
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

      await new Promise(resolve => setTimeout(resolve, 2000));

      const balanceField = isDemo ? "demo_balance" : "balance";
      const newBalance = currentBalance - amount;

      const { error: updateError } = await supabase
        .from("portfolios")
        .update({ [balanceField]: newBalance })
        .eq("id", portfolioId);

      if (updateError) throw updateError;

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
