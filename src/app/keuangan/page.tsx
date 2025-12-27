"use client";

import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, Plus, Receipt, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useData } from "@/context/DataContext";
import { cn } from "@/lib/utils";

export default function KeuanganPage() {
  const { transactions, addTransaction, t } = useData();
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense">("income");
  
  // State untuk filter bulan dan tahun
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [formData, setFormData] = useState({
    category: "",
    amount: 0,
    description: "",
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddTransaction = async () => {
    if (formData.category && formData.amount > 0) {
      try {
        await addTransaction({
          type: transactionType,
          category: formData.category,
          amount: formData.amount,
          description: formData.description,
          date: formData.date
        });
        setIsDialogOpen(false);
        setFormData({
          category: "",
          amount: 0,
          description: "",
          date: new Date().toISOString().split('T')[0]
        });
      } catch (error) {
        console.error(error);
        alert("Gagal menambah transaksi.");
      }
    }
  };

  // Filter transaksi berdasarkan bulan dan tahun terpilih
  const filteredByDate = transactions.filter(tr => {
    const d = new Date(tr.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const totalIncome = filteredByDate
    .filter(tr => tr.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalExpense = filteredByDate
    .filter(tr => tr.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const displayTransactions = filteredByDate.filter(tr => 
    activeTab === "all" ? true : tr.type === activeTab
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const openDialog = (type: "income" | "expense") => {
    setTransactionType(type);
    setIsDialogOpen(true);
  };

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('finance_title')}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">{t('finance_subtitle')}</p>
        </div>

        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
          <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-md px-3 h-12 sm:h-10 shadow-sm flex-1 sm:flex-none">
            <CalendarIcon size={18} className="text-muted-foreground" />
            <select 
              className="text-sm sm:text-sm font-semibold border-none focus:ring-0 outline-none bg-transparent text-foreground flex-1 cursor-pointer py-2"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {months.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <select 
              className="text-sm sm:text-sm font-semibold border-none focus:ring-0 outline-none bg-transparent text-foreground flex-none cursor-pointer py-2"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="h-10 px-4 flex-1 text-[10px] sm:text-xs font-semibold shadow-sm" onClick={() => openDialog("expense")}>
              <Plus size={14} className="mr-2 text-rose-500" />
              {t('out')}
            </Button>
            <Button size="sm" className="h-10 px-4 flex-1 text-[10px] sm:text-xs font-semibold shadow-sm" onClick={() => openDialog("income")}>
              <Plus size={14} className="mr-2 text-emerald-400" />
              {t('in')}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah {transactionType === "income" ? t('in') : t('out')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t('category')}</Label>
              <Input 
                placeholder={transactionType === "income" ? "Contoh: Sewa Kamar, Laundry" : "Contoh: Listrik, Air, Kebersihan"}
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('amount')} (Rp)</Label>
              <Input 
                type="number" 
                placeholder="100000"
                value={formData.amount || ""}
                onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value)})}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('description')}</Label>
              <Input 
                placeholder="Deskripsi opsional"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('date')}</Label>
              <Input 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleAddTransaction}>Simpan Transaksi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border-border bg-card">
          <CardContent className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">{t('income')}</p>
              <TrendingUp size={14} className="text-emerald-500" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold tracking-tight text-emerald-600">Rp {totalIncome.toLocaleString()}</div>
              <p className="text-[9px] text-muted-foreground font-medium">{months[selectedMonth]}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-card">
          <CardContent className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">{t('expense')}</p>
              <TrendingDown size={14} className="text-rose-500" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold tracking-tight text-rose-600">Rp {totalExpense.toLocaleString()}</div>
              <p className="text-[9px] text-muted-foreground font-medium">{months[selectedMonth]}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-foreground text-background col-span-2 lg:col-span-1">
          <CardContent className="p-4 flex flex-row items-center justify-between min-h-[60px]">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold opacity-70">{t('net_profit')}</p>
              <div className="text-xl sm:text-2xl font-bold tracking-tight">Rp {(totalIncome - totalExpense).toLocaleString()}</div>
            </div>
            <Wallet size={20} className="opacity-70" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="bg-secondary/30 p-1 border border-border/50 h-11 w-full max-w-[400px]">
          <TabsTrigger value="all" className="flex-1 rounded-md text-[10px] sm:text-xs font-semibold px-4">{t('all')}</TabsTrigger>
          <TabsTrigger value="income" className="flex-1 rounded-md text-[10px] sm:text-xs font-semibold px-4">{t('in')}</TabsTrigger>
          <TabsTrigger value="expense" className="flex-1 rounded-md text-[10px] sm:text-xs font-semibold px-4">{t('out')}</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-0">
          <Card className="shadow-sm border-border overflow-hidden rounded-2xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto scrollbar-hide">
                <Table>
                  <TableHeader className="bg-muted/50 border-b">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="py-4 px-4 font-semibold text-foreground whitespace-nowrap text-[10px]">Info Transaksi</TableHead>
                      <TableHead className="py-4 px-4 font-semibold text-foreground whitespace-nowrap text-right text-[10px]">{t('amount')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayTransactions.map((tr) => (
                      <TableRow key={tr.id} className="group hover:bg-muted/50 transition-colors border-border">
                        <TableCell className="py-4 px-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[9px] font-semibold px-1.5 py-0 bg-muted/30 border-border whitespace-nowrap">{tr.category}</Badge>
                              <span className="text-[10px] text-muted-foreground font-medium">{tr.date}</span>
                            </div>
                            <span className="text-xs font-bold text-foreground truncate max-w-[180px] sm:max-w-none italic">"{tr.description || "-"}"</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex flex-col items-end gap-1">
                            <span className={cn(
                              "font-bold text-sm sm:text-base tracking-tight",
                              tr.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                            )}>
                              {tr.type === 'income' ? '+' : '-'} Rp {tr.amount.toLocaleString()}
                            </span>
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              tr.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'
                            )} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {displayTransactions.length === 0 && (
                      <TableRow><TableCell colSpan={2} className="text-center py-12 text-muted-foreground italic text-sm">Belum ada data transaksi.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
