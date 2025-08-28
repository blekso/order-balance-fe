/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { ISymbol } from "../../@types";
import OrderBookTable from "./OrderBookTable";
import { OrderType } from "../../@types/order";
import { setCurrentSymbolPrice } from "../../domain/store";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";

interface OrderBookProps {
  symbol: ISymbol;
  onPriceSelected: (price: number) => void;
}

const OrderBook: React.FC<OrderBookProps> = ({ symbol, onPriceSelected }) => {
  const [buyData, setBuyData] = useState([]);
  const [sellData, setSellData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND_URL as string, {
      transports: ["websocket"],
    });
    const sym = symbol.symbol.toLowerCase();

    socket.emit("subscribe", { symbol: sym });

    socket.on("depth_update", (msg) => {
      const data = msg.data;
      setBuyData(
        data.bids
          .map(([p, q]: [string, string]) => {
            const price = parseFloat(p),
              qty = parseFloat(q);
            return { price, quantity: qty, total: price * qty };
          })
          .sort((a: any, b: any) => b.total - a.total)
      );
      setSellData(
        data.asks
          .map(([p, q]: [string, string]) => {
            const price = parseFloat(p),
              qty = parseFloat(q);
            return { price, quantity: qty, total: price * qty };
          })
          .sort((a: any, b: any) => b.total - a.total)
      );
    });

    socket.on("ticker_update", (msg) => {
      const price = parseFloat(msg.c);
      setCurrentPrice(price);
      dispatch(setCurrentSymbolPrice(price));
    });

    return () => {
      socket.emit("unsubscribe", { symbol: sym });
      socket.disconnect();
    };
  }, [symbol.symbol]);

  return (
    <div className="border-slate-500 bg-slate-900 border rounded-xl mb-4">
      <div className="w-full xl:w-auto flex-grow px-4 py-2 font-medium">
        Order Book
      </div>
      <div className="flex xl:flex-col lg:flex-row xs:flex-col justify-center">
        <div className="w-full xl:w-auto flex-grow">
          <OrderBookTable
            type={OrderType.Buy}
            orderData={sellData}
            onRowClicked={(price: number) => {
              onPriceSelected(price);
            }}
          />
        </div>
        <div className="text-center py-8 xl:block hidden">
          <span className="text-5xl">{currentPrice.toFixed(2)}</span>
        </div>
        <div className="w-full xl:w-auto flex-grow">
          <OrderBookTable
            type={OrderType.Sell}
            orderData={buyData}
            onRowClicked={(price: number) => {
              onPriceSelected(price);
            }}
          />
        </div>
      </div>
      <div className="text-center py-4 xl:hidden block">
        <span className="text-4xl">{currentPrice.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default OrderBook;
