import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Verify Midtrans signature
async function verifySignature(orderId: string, statusCode: string, grossAmount: string, serverKey: string, signatureKey: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${orderId}${statusCode}${grossAmount}${serverKey}`);
  
  const hashBuffer = await crypto.subtle.digest("SHA-512", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex === signatureKey;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const notification = await req.json();
    console.log("Received Midtrans webhook:", notification);

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = notification;

    // Verify signature
    const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY") ?? "";
    const isValidSignature = await verifySignature(order_id, status_code, gross_amount, serverKey, signature_key);
    
    if (!isValidSignature) {
      console.error("Invalid signature for order:", order_id);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get transaction by reference_id
    const { data: transaction, error: txError } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("reference_id", order_id)
      .single();

    if (txError || !transaction) {
      console.error("Transaction not found:", order_id);
      return new Response(JSON.stringify({ error: "Transaction not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine transaction status
    let newStatus = "pending";
    let shouldUpdateBalance = false;

    if (transaction_status === "capture" || transaction_status === "settlement") {
      if (fraud_status === "accept" || !fraud_status) {
        newStatus = "success";
        shouldUpdateBalance = true;
      } else {
        newStatus = "failed";
      }
    } else if (transaction_status === "pending") {
      newStatus = "processing";
    } else if (["deny", "cancel", "expire", "failure"].includes(transaction_status)) {
      newStatus = "failed";
    }

    console.log(`Updating transaction ${order_id} to status: ${newStatus}`);

    // Update transaction status
    const { error: updateError } = await supabaseAdmin
      .from("transactions")
      .update({
        status: newStatus,
        completed_at: shouldUpdateBalance ? new Date().toISOString() : null,
      })
      .eq("id", transaction.id);

    if (updateError) {
      console.error("Error updating transaction:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update transaction" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update portfolio balance if payment successful
    if (shouldUpdateBalance && transaction.type === "deposit") {
      // Get user's default portfolio
      const { data: portfolio, error: portfolioError } = await supabaseAdmin
        .from("portfolios")
        .select("*")
        .eq("user_id", transaction.user_id)
        .eq("is_default", true)
        .single();

      if (portfolio && !portfolioError) {
        const newBalance = Number(portfolio.balance) + Number(transaction.amount);
        
        const { error: balanceError } = await supabaseAdmin
          .from("portfolios")
          .update({ balance: newBalance })
          .eq("id", portfolio.id);

        if (balanceError) {
          console.error("Error updating balance:", balanceError);
        } else {
          console.log(`Balance updated for user ${transaction.user_id}: +${transaction.amount}`);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Webhook error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
