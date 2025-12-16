import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { amount, type, portfolioId } = await req.json();

    if (!amount || amount < 10000) {
      return new Response(JSON.stringify({ error: "Minimum amount is Rp 10,000" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderId = `${type.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY");
    const isProduction = serverKey?.startsWith("Mid-server-") && !serverKey.includes("SB");
    const midtransUrl = isProduction 
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    // Create transaction record first
    const { data: transaction, error: txError } = await supabaseClient
      .from("transactions")
      .insert({
        user_id: user.id,
        type: type,
        amount: amount,
        method: "DANA",
        status: "pending",
        is_demo: false,
        reference_id: orderId,
      })
      .select()
      .single();

    if (txError) {
      console.error("Error creating transaction record:", txError);
      return new Response(JSON.stringify({ error: "Failed to create transaction" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Midtrans Snap transaction
    const midtransPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        email: user.email,
      },
      enabled_payments: ["dana"],
      callbacks: {
        finish: `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || ''}/`,
      },
      metadata: {
        transaction_id: transaction.id,
        portfolio_id: portfolioId,
        type: type,
      },
    };

    console.log("Creating Midtrans transaction:", { orderId, amount, type });

    const authString = btoa(`${serverKey}:`);
    const midtransResponse = await fetch(midtransUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authString}`,
      },
      body: JSON.stringify(midtransPayload),
    });

    const midtransData = await midtransResponse.json();

    if (!midtransResponse.ok) {
      console.error("Midtrans error:", midtransData);
      // Update transaction to failed
      await supabaseClient
        .from("transactions")
        .update({ status: "failed" })
        .eq("id", transaction.id);
      
      return new Response(JSON.stringify({ error: "Payment gateway error", details: midtransData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Midtrans transaction created successfully:", midtransData);

    return new Response(JSON.stringify({
      token: midtransData.token,
      redirect_url: midtransData.redirect_url,
      order_id: orderId,
      transaction_id: transaction.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
