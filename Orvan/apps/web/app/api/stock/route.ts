import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");

  if (!ticker) {
    return NextResponse.json({ error: "Ticker is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1d&interval=15m`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", 
          "Accept": "application/json"
        },
        next: { revalidate: 60 }
      }
    );

    const data = await response.json();
    const result = data.chart.result[0];
    
    const closePrices = result.indicators.quote[0].close;
    const currentPrice = result.meta.regularMarketPrice;
    const previousClose = result.meta.previousClose;
    const change = currentPrice - previousClose;

    const chartData = closePrices
      .filter((price: number | null) => price !== null)
      .map((price: number) => ({ value: price }));

    return NextResponse.json({
      price: currentPrice,
      change: change,
      chartData: chartData
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}