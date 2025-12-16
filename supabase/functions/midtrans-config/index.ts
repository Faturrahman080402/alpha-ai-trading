import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientKey = Deno.env.get("MIDTRANS_CLIENT_KEY") ?? "";
  const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY") ?? "";
  
  // Determine if we're in sandbox or production based on server key
  const isProduction = serverKey.startsWith("Mid-server-") && !serverKey.includes("SB");
  
  return new Response(JSON.stringify({
    clientKey,
    isProduction,
    snapUrl: isProduction 
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js"
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
