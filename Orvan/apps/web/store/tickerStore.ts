import { create } from 'zustand';

interface TickerStore {
  activeTicker: string;
  setActiveTicker: (ticker: string) => void;
}

export const useTickerStore = create<TickerStore>((set) => ({
  activeTicker: "AAPL", 
  setActiveTicker: (ticker) => set({ activeTicker: ticker }),
}));