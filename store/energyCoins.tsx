import React from 'react';

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  // Fallback for web or environments without AsyncStorage
  AsyncStorage = null;
}

const KEY = 'energyCoins:v1';

export type CoinsState = {
  date: string; // YYYY-MM-DD
  coins: number; // remaining
  spent: Array<{ id: string; ts: number; label: string; cost: number }>
  setDaily: (count: number) => Promise<void>;
  spend: (label: string, cost: number) => Promise<void>;
  resetDay: (date?: string) => Promise<void>;
};

export const EnergyCoinsContext = React.createContext<CoinsState | null>(null);

export function EnergyCoinsProvider({ children }: { children: React.ReactNode }){
  const today = new Date().toISOString().slice(0,10);
  const [date, setDate] = React.useState(today);
  const [coins, setCoins] = React.useState(10);
  const [spent, setSpent] = React.useState<CoinsState['spent']>([]);
  React.useEffect(()=>{ (async()=>{ if (!AsyncStorage) return; try{ const raw=await AsyncStorage.getItem(KEY); if(raw){ const d=JSON.parse(raw); if(d.date!==today){ setDate(today); setCoins(d.default||10); setSpent([]);} else { setDate(d.date); setCoins(d.coins); setSpent(d.spent||[]);} } }catch{} })(); },[]);
  const persist = async(next:{date:string;coins:number;spent:CoinsState['spent']})=>{ setDate(next.date); setCoins(next.coins); setSpent(next.spent); if (!AsyncStorage) return; try{ await AsyncStorage.setItem(KEY, JSON.stringify(next)); }catch{} };
  const setDaily: CoinsState['setDaily'] = async (count)=>{ await persist({ date, coins: count - spent.reduce((a,b)=>a+b.cost,0), spent}); };
  const spend: CoinsState['spend'] = async (label, cost)=>{ const item={ id: Math.random().toString(36).slice(2), ts: Date.now(), label, cost }; await persist({ date, coins: Math.max(0, coins - cost), spent: [item, ...spent].slice(0,200) }); };
  const resetDay: CoinsState['resetDay'] = async (d)=>{ const nextDate = d || new Date().toISOString().slice(0,10); await persist({ date: nextDate, coins: 10, spent: [] }); };
  const value: CoinsState = { date, coins, spent, setDaily, spend, resetDay };
  return <EnergyCoinsContext.Provider value={value}>{children}</EnergyCoinsContext.Provider>;
}

export function useEnergyCoins(){
  const ctx = React.useContext(EnergyCoinsContext);
  if(!ctx) throw new Error('EnergyCoinsProvider missing');
  return ctx;
}
