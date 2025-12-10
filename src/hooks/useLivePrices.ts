import { useState, useEffect, useCallback, useRef } from "react";

export interface LivePrice {
  symbol: string;
  price: number;
  change: number;
  volume: string;
  lastUpdate: number;
}

const INITIAL_PRICES: Record<string, LivePrice> = {
  "BTC/USDT": { symbol: "BTC/USDT", price: 0, change: 0, volume: "—", lastUpdate: 0 },
  "ETH/USDT": { symbol: "ETH/USDT", price: 0, change: 0, volume: "—", lastUpdate: 0 },
  "BNB/USDT": { symbol: "BNB/USDT", price: 0, change: 0, volume: "—", lastUpdate: 0 },
  "SOL/USDT": { symbol: "SOL/USDT", price: 0, change: 0, volume: "—", lastUpdate: 0 },
};

const WS_URL = `wss://dlveppmpsaosloyiiema.supabase.co/functions/v1/binance-prices`;
const REST_URL = `https://dlveppmpsaosloyiiema.supabase.co/functions/v1/binance-prices`;

export const useLivePrices = () => {
  const [prices, setPrices] = useState<Record<string, LivePrice>>(INITIAL_PRICES);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial prices via REST
  const fetchInitialPrices = useCallback(async () => {
    try {
      const response = await fetch(REST_URL);
      const data = await response.json();
      
      if (data.prices) {
        const priceMap: Record<string, LivePrice> = {};
        data.prices.forEach((p: LivePrice) => {
          priceMap[p.symbol] = p;
        });
        setPrices((prev) => ({ ...prev, ...priceMap }));
      }
    } catch (error) {
      console.error("Failed to fetch initial prices:", error);
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    console.log("Connecting to Binance price feed...");
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to live price feed");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "price_update" && data.symbol) {
          setPrices((prev) => ({
            ...prev,
            [data.symbol]: {
              symbol: data.symbol,
              price: data.price,
              change: data.change,
              volume: data.volume,
              lastUpdate: data.lastUpdate,
            },
          }));
        }
      } catch (error) {
        console.error("Error parsing price data:", error);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from price feed");
      setIsConnected(false);
      wsRef.current = null;
      
      // Reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      ws.close();
    };
  }, []);

  useEffect(() => {
    // Fetch initial prices first
    fetchInitialPrices();
    
    // Then connect to WebSocket for live updates
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect, fetchInitialPrices]);

  const getPrice = useCallback(
    (symbol: string): LivePrice | null => {
      return prices[symbol] || null;
    },
    [prices]
  );

  return { prices, getPrice, isConnected };
};
