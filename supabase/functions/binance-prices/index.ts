import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BINANCE_WS_URL = "wss://stream.binance.com:9443/ws";
const SYMBOLS = ["btcusdt", "ethusdt", "bnbusdt", "solusdt"];

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  // Handle WebSocket upgrade
  if (upgradeHeader.toLowerCase() === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);

    // Connect to Binance WebSocket
    const streams = SYMBOLS.map((s) => `${s}@ticker`).join("/");
    const binanceSocket = new WebSocket(`${BINANCE_WS_URL}/${streams}`);

    binanceSocket.onopen = () => {
      console.log("Connected to Binance WebSocket");
    };

    binanceSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.s && data.c) {
          // Format: { symbol, price, change, volume }
          const formatted = {
            type: "price_update",
            symbol: formatSymbol(data.s),
            price: parseFloat(data.c),
            change: parseFloat(data.P),
            volume: formatVolume(parseFloat(data.v) * parseFloat(data.c)),
            lastUpdate: Date.now(),
          };
          
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(formatted));
          }
        }
      } catch (error) {
        console.error("Error parsing Binance data:", error);
      }
    };

    binanceSocket.onerror = (error) => {
      console.error("Binance WebSocket error:", error);
    };

    binanceSocket.onclose = () => {
      console.log("Binance WebSocket closed");
    };

    socket.onclose = () => {
      console.log("Client disconnected");
      binanceSocket.close();
    };

    socket.onerror = (error) => {
      console.error("Client WebSocket error:", error);
      binanceSocket.close();
    };

    return response;
  }

  // HTTP fallback - return current prices via REST
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(SYMBOLS.map((s) => s.toUpperCase()))}`
    );
    const data = await response.json();

    const prices = data.map((ticker: any) => ({
      symbol: formatSymbol(ticker.symbol),
      price: parseFloat(ticker.lastPrice),
      change: parseFloat(ticker.priceChangePercent),
      volume: formatVolume(parseFloat(ticker.volume) * parseFloat(ticker.lastPrice)),
      lastUpdate: Date.now(),
    }));

    return new Response(JSON.stringify({ prices }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error fetching prices:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch prices" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});

function formatSymbol(symbol: string): string {
  // Convert BTCUSDT to BTC/USDT
  const base = symbol.slice(0, -4);
  return `${base}/USDT`;
}

function formatVolume(volume: number): string {
  if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
  return volume.toFixed(0);
}
