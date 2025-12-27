"use client";

import { useState } from "react";
import { 
  Users, 
  DoorOpen, 
  Wallet, 
  WashingMachine,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/context/DataContext";

export default function DashboardPage() {
  const { rooms, tenancies, transactions, laundry, residents, t } = useData();

  // State untuk filter bulan dan tahun
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const totalResidents = tenancies.filter(t => t.status === 'active').length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  
  const filteredTransactions = transactions.filter(tr => {
    const d = new Date(tr.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const income = filteredTransactions
    .filter(tr => tr.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const expense = filteredTransactions
    .filter(tr => tr.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const activeLaundry = laundry.filter(l => l.status === 'process').length;

  const totalAllTimeIncome = transactions
    .filter(tr => tr.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalAllTimeExpense = transactions
    .filter(tr => tr.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const nettMoney = totalAllTimeIncome - totalAllTimeExpense;

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('overview_title')}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">{t('overview_subtitle')}</p>
        </div>

        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
          <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-md px-3 h-12 sm:h-10 shadow-sm flex-1 sm:flex-none">
            <CalendarIcon size={18} className="text-muted-foreground" />
            <select 
              className="text-sm font-semibold border-none focus:ring-0 outline-none bg-transparent text-foreground flex-1 cursor-pointer py-2"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {months.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <select 
              className="text-sm font-semibold border-none focus:ring-0 outline-none bg-transparent text-foreground flex-none cursor-pointer py-2"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="bg-secondary text-secondary-foreground px-4 h-12 sm:h-10 flex items-center justify-center rounded-md text-xs font-bold border border-border w-full sm:w-auto">
            {t('total_cash')}: Rp {nettMoney.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border bg-card">
          <CardContent className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">{t('income')}</p>
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold tracking-tight text-emerald-600">Rp {income.toLocaleString()}</div>
              <p className="text-[9px] text-muted-foreground font-medium">{months[selectedMonth]}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border bg-card">
          <CardContent className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">{t('expense')}</p>
              <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold tracking-tight text-rose-600">Rp {expense.toLocaleString()}</div>
              <p className="text-[9px] text-muted-foreground font-medium">{months[selectedMonth]}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-card">
          <CardContent className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">{t('available')}</p>
              <DoorOpen className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">{availableRooms} <span className="text-[10px] sm:text-sm font-normal text-muted-foreground">{t('unit')}</span></div>
              <p className="text-[9px] text-muted-foreground font-medium italic">{t('readiness')}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-card">
          <CardContent className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">{t('laundry')}</p>
              <WashingMachine className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">{activeLaundry} <span className="text-[10px] sm:text-sm font-normal text-muted-foreground">Order</span></div>
              <p className="text-[9px] text-muted-foreground font-medium italic">{t('ongoing')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold">{t('last_transactions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((tr) => (
                <div key={tr.id} className="flex items-center gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tr.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tr.category} - {tr.description || "Tanpa deskripsi"}</p>
                    <p className="text-xs text-muted-foreground">{tr.date}</p>
                  </div>
                  <div className={`text-sm font-bold flex-shrink-0 ${tr.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tr.type === 'income' ? '+' : '-'} Rp {tr.amount.toLocaleString()}
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 italic">{t('no_transactions')}</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3 shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold">{t('monthly_performance')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('income')} ({months[selectedMonth]})</span>
                <span className="font-bold text-emerald-600">Rp {income.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[70%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('expense')} ({months[selectedMonth]})</span>
                <span className="font-bold text-rose-600">Rp {expense.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full w-[30%]" />
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{t('net_profit')}</span>
                <span className="text-lg font-black text-foreground underline decoration-primary underline-offset-4">Rp {(income - expense).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
