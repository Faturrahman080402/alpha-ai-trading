import { useState, useEffect, useCallback } from "react";

export interface LivePrice {
  symbol: string;
  price: number;
  change: number;
  volume: string;
  lastUpdate: number;
}

const INITIAL_PRICES: Record<string, LivePrice> = {
  "BTC/USDT": { symbol: "BTC/USDT", price: 43284.50, change: 2.45, volume: "28.5B", lastUpdate: Date.now() },
  "ETH/USDT": { symbol: "ETH/USDT", price: 2298.45, change: 1.82, volume: "14.2B", lastUpdate: Date.now() },
  "BNB/USDT": { symbol: "BNB/USDT", price: 312.85, change: -0.54, volume: "1.8B", lastUpdate: Date.now() },
  "SOL/USDT": { symbol: "SOL/USDT", price: 99.20, change: 4.12, volume: "2.1B", lastUpdate: Date.now() },
};

export const useLivePrices = () => {
  const [prices, setPrices] = useState<Record<string, LivePrice>>(INITIAL_PRICES);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(true);

    // Simulate live price updates every 2 seconds
    const interval = setInterval(() => {
      setPrices((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((symbol) => {
          const currentPrice = updated[symbol].price;
          const volatility = symbol.includes("BTC") ? 50 : symbol.includes("ETH") ? 10 : 2;
          const priceChange = (Math.random() - 0.5) * volatility;
          const newPrice = Math.max(currentPrice + priceChange, 0.01);
          const changePercent = ((newPrice - currentPrice) / currentPrice) * 100;
          
          updated[symbol] = {
            ...updated[symbol],
            price: newPrice,
            change: updated[symbol].change + changePercent * 0.1,
            lastUpdate: Date.now(),
          };
        });
        return updated;
      });
    }, 2000);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, []);

  const getPrice = useCallback((symbol: string): LivePrice | null => {
    return prices[symbol] || null;
  }, [prices]);

  return { prices, getPrice, isConnected };
};
