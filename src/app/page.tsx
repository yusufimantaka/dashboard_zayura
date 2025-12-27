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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Overview performa bisnis Zayura Exclusive.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-xs font-medium border border-border">
            Total Kas: Rp {nettMoney.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Kas</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">Rp {nettMoney.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">Likuiditas tersedia</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nett Money</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">Rp {nettMoney.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">Akumulasi laba bersih</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unit Tersedia</CardTitle>
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{availableRooms} / {rooms.length}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">Kesiapan hunian</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laundry Proses</CardTitle>
            <WashingMachine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{activeLaundry}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">Pesanan ongoing</p>
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
