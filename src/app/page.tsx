"use client";

import { 
  Users, 
  DoorOpen, 
  Wallet, 
  WashingMachine,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/context/DataContext";

export default function DashboardPage() {
  const { rooms, tenancies, transactions, laundry, residents } = useData();

  const totalResidents = tenancies.filter(t => t.status === 'active').length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const income = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const expense = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const activeLaundry = laundry.filter(l => l.status === 'process').length;

  const totalAllTimeIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalAllTimeExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const nettMoney = totalAllTimeIncome - totalAllTimeExpense;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Overview performa bisnis Zayura Exclusive.</p>
        </div>
        <div className="bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-semibold border border-border w-full sm:w-auto text-center sm:text-left">
          Total Kas: Rp {nettMoney.toLocaleString()}
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border bg-card">
          <CardContent className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Saldo Kas</p>
              <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">Rp {nettMoney.toLocaleString()}</div>
              <p className="text-[9px] text-muted-foreground font-medium italic">Likuiditas</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border bg-card">
          <CardContent className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Nett Money</p>
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">Rp {nettMoney.toLocaleString()}</div>
              <p className="text-[9px] text-muted-foreground font-medium italic">Laba Bersih</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-card">
          <CardContent className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Tersedia</p>
              <DoorOpen className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">{availableRooms} <span className="text-[10px] sm:text-sm font-normal text-muted-foreground">Unit</span></div>
              <p className="text-[9px] text-muted-foreground font-medium italic">Kesiapan</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-card">
          <CardContent className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Laundry</p>
              <WashingMachine className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">{activeLaundry} <span className="text-[10px] sm:text-sm font-normal text-muted-foreground">Order</span></div>
              <p className="text-[9px] text-muted-foreground font-medium italic">Ongoing</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold">Transaksi Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(-5).reverse().map((t) => (
                <div key={t.id} className="flex items-center gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.category} - {t.description || "Tanpa deskripsi"}</p>
                    <p className="text-xs text-muted-foreground">{t.date}</p>
                  </div>
                  <div className={`text-sm font-bold flex-shrink-0 ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'income' ? '+' : '-'} Rp {t.amount.toLocaleString()}
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 italic">Belum ada aktivitas transaksi.</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3 shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold">Performa Bulanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pemasukan ({new Date().toLocaleString('id-ID', { month: 'long' })})</span>
                <span className="font-bold text-emerald-600">Rp {income.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[70%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pengeluaran ({new Date().toLocaleString('id-ID', { month: 'long' })})</span>
                <span className="font-bold text-rose-600">Rp {expense.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full w-[30%]" />
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Laba Bersih</span>
                <span className="text-lg font-black text-foreground underline decoration-primary underline-offset-4">Rp {(income - expense).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
