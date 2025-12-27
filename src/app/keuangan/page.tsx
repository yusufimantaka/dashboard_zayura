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
  const { transactions, addTransaction } = useData();
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
  const filteredByDate = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const totalIncome = filteredByDate
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalExpense = filteredByDate
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const displayTransactions = filteredByDate.filter(t => 
    activeTab === "all" ? true : t.type === activeTab
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Arus Keuangan</h2>
          <p className="text-sm text-muted-foreground">Monitoring performa finansial dan likuiditas.</p>
        </div>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-md px-3 h-10 shadow-sm flex-1 sm:flex-none">
            <CalendarIcon size={16} className="text-muted-foreground" />
            <select 
              className="text-xs font-bold border-none focus:ring-0 outline-none bg-transparent text-foreground flex-1"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {months.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <select 
              className="text-xs font-bold border-none focus:ring-0 outline-none bg-transparent text-foreground flex-1"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="h-10 px-4 flex-1 sm:flex-none" onClick={() => openDialog("expense")}>
              <Plus size={16} className="mr-2" />
              Pengeluaran
            </Button>
            <Button size="sm" className="h-10 px-4 shadow-sm flex-1 sm:flex-none" onClick={() => openDialog("income")}>
              <Plus size={16} className="mr-2" />
              Pemasukan
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah {transactionType === "income" ? "Pemasukan" : "Pengeluaran"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Kategori</Label>
              <Input 
                placeholder={transactionType === "income" ? "Contoh: Sewa Kamar, Laundry" : "Contoh: Listrik, Air, Kebersihan"}
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label>Jumlah (Rp)</Label>
              <Input 
                type="number" 
                placeholder="100000"
                value={formData.amount || ""}
                onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value)})}
              />
            </div>
            <div className="grid gap-2">
              <Label>Keterangan</Label>
              <Input 
                placeholder="Deskripsi opsional"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label>Tanggal</Label>
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

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-emerald-600">Rp {totalIncome.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-tight">{months[selectedMonth]}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-destructive">Rp {totalExpense.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-tight">{months[selectedMonth]}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border bg-foreground text-background col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-70">Saldo Bersih</CardTitle>
            <Wallet className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">Rp {(totalIncome - totalExpense).toLocaleString()}</div>
            <p className="text-[10px] opacity-50 font-medium mt-1 uppercase tracking-tight italic">Net Cash Flow</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="bg-secondary/30 p-1 border border-border/50 h-10 w-full sm:w-auto">
          <TabsTrigger value="all" className="flex-1 sm:flex-none px-6">Semua</TabsTrigger>
          <TabsTrigger value="income" className="flex-1 sm:flex-none px-6">Pemasukan</TabsTrigger>
          <TabsTrigger value="expense" className="flex-1 sm:flex-none px-6">Pengeluaran</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-0">
          <Card className="shadow-sm border-border overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="py-4 px-6 font-bold text-foreground uppercase tracking-widest text-[10px] whitespace-nowrap">Tanggal</TableHead>
                      <TableHead className="py-4 font-bold text-foreground uppercase tracking-widest text-[10px] whitespace-nowrap">Kategori</TableHead>
                      <TableHead className="py-4 font-bold text-foreground uppercase tracking-widest text-[10px] whitespace-nowrap">Deskripsi</TableHead>
                      <TableHead className="py-4 font-bold text-foreground uppercase tracking-widest text-[10px] whitespace-nowrap">Jumlah</TableHead>
                      <TableHead className="py-4 text-right px-6 font-bold text-foreground uppercase tracking-widest text-[10px] whitespace-nowrap">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayTransactions.map((t) => (
                      <TableRow key={t.id} className="group hover:bg-muted/50 transition-colors border-border">
                        <TableCell className="py-4 px-6 font-medium text-muted-foreground text-sm whitespace-nowrap">{t.date}</TableCell>
                        <TableCell className="py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground text-sm">{t.category}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-muted-foreground text-sm italic truncate max-w-[200px] whitespace-nowrap">"{t.description}"</TableCell>
                        <TableCell className="py-4 whitespace-nowrap">
                          <span className={cn(
                            "font-bold tracking-tight text-sm",
                            t.type === 'income' ? 'text-emerald-600' : 'text-destructive'
                          )}>
                            {t.type === 'income' ? '+' : '-'} Rp {t.amount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 text-right px-6 whitespace-nowrap">
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold text-[10px] uppercase shadow-none">Success</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {displayTransactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                          Belum ada data transaksi di bulan ini.
                        </TableCell>
                      </TableRow>
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
