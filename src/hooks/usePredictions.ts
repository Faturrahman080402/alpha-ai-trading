import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Prediction {
  id: string;
  symbol: string;
  prediction_type: string;
  predicted_direction: string;
  confidence: number;
  predicted_price: number | null;
  timeframe: string;
  model_used: string;
  created_at: string;
  expires_at: string;
}

export const usePredictions = () => {
  return useQuery({
    queryKey: ["predictions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_predictions")
        .select("*")
        .gt("expires_at", new Date().toISOString())
        .order("confidence", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as Prediction[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
