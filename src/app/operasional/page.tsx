"use client";

import { useState } from "react";
import { Receipt, Plus, Zap, Droplets, Hammer, Trash2, Wallet, Calendar as CalendarIcon } from "lucide-react";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useData } from "@/context/DataContext";

export default function OperasionalPage() {
  const { transactions, addTransaction } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // State untuk filter bulan dan tahun
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [formData, setFormData] = useState({
    category: "",
    amount: 0,
    description: "",
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddOps = async () => {
    if (formData.category && formData.amount > 0) {
      try {
        await addTransaction({
          type: 'expense',
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
        alert("Gagal menambah biaya operasional.");
      }
    }
  };

  // Filter data berdasarkan bulan dan tahun terpilih
  const opsData = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'expense' && 
           d.getMonth() === selectedMonth && 
           d.getFullYear() === selectedYear;
  });
  
  const getCategoryTotal = (cat: string) => {
    return opsData
      .filter(t => t.category.toLowerCase().includes(cat.toLowerCase()))
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  const totalOps = opsData.reduce((acc, curr) => acc + curr.amount, 0);

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Biaya Operasional</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Monitoring pengeluaran unit.</p>
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

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-10 px-4 text-[10px] sm:text-xs font-semibold shadow-sm w-full sm:w-auto">
                <Plus size={18} className="mr-2" />
                Input Pengeluaran
              </Button>
            </DialogTrigger>
            {/* ... DialogContent ... */}
          </Dialog>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-5">
        <Card className="shadow-sm border-border px-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-3 pt-4 sm:px-6">
            <CardTitle className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Listrik</CardTitle>
            <Zap size={14} className="text-amber-500" />
          </CardHeader>
          <CardContent className="px-3 pb-4 sm:px-6 sm:pb-6">
            <div className="text-sm sm:text-lg font-bold text-foreground truncate">Rp {getCategoryTotal('Listrik').toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border px-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-3 pt-4 sm:px-6">
            <CardTitle className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Air</CardTitle>
            <Droplets size={14} className="text-blue-500" />
          </CardHeader>
          <CardContent className="px-3 pb-4 sm:px-6 sm:pb-6">
            <div className="text-sm sm:text-lg font-bold text-foreground truncate">Rp {getCategoryTotal('Air').toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border px-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-3 pt-4 sm:px-6">
            <CardTitle className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Gaji</CardTitle>
            <Wallet size={14} className="text-emerald-500" />
          </CardHeader>
          <CardContent className="px-3 pb-4 sm:px-6 sm:pb-6">
            <div className="text-sm sm:text-lg font-bold text-foreground truncate">Rp {getCategoryTotal('Gaji').toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border px-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-3 pt-4 sm:px-6">
            <CardTitle className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Reparasi</CardTitle>
            <Hammer size={14} className="text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-4 sm:px-6 sm:pb-6">
            <div className="text-sm sm:text-lg font-bold text-foreground truncate">Rp {getCategoryTotal('Maintenance').toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border bg-foreground text-background col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-4 pt-4 sm:px-6">
            <CardTitle className="text-[10px] sm:text-xs font-semibold opacity-70">Total Ops</CardTitle>
            <Receipt size={14} className="opacity-70" />
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">Rp {totalOps.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border overflow-hidden rounded-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-4 px-6 font-semibold text-foreground whitespace-nowrap text-[10px]">Tanggal</TableHead>
                  <TableHead className="py-4 font-semibold text-foreground whitespace-nowrap text-[10px]">Kategori</TableHead>
                  <TableHead className="py-4 font-semibold text-foreground whitespace-nowrap text-[10px]">Deskripsi</TableHead>
                  <TableHead className="py-4 font-semibold text-foreground whitespace-nowrap text-[10px]">Jumlah</TableHead>
                  <TableHead className="py-4 text-right px-6 font-semibold text-foreground whitespace-nowrap text-[10px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((o) => (
                  <TableRow key={o.id} className="group hover:bg-muted/50 transition-colors border-border">
                    <TableCell className="py-5 px-6 font-medium text-muted-foreground text-[10px] sm:text-xs whitespace-nowrap">{o.date}</TableCell>
                    <TableCell className="py-5 whitespace-nowrap">
                      <Badge variant="outline" className="text-[9px] font-semibold px-2 py-0.5 bg-muted/30 border-border whitespace-nowrap">{o.category}</Badge>
                    </TableCell>
                    <TableCell className="py-5 text-foreground font-semibold italic text-[10px] sm:text-xs truncate max-w-[120px] whitespace-nowrap">"{o.description || "-"}"</TableCell>
                    <TableCell className="py-5 font-bold text-rose-600 text-xs sm:text-sm whitespace-nowrap">Rp {o.amount.toLocaleString()}</TableCell>
                    <TableCell className="py-5 text-right px-6 whitespace-nowrap">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-rose-500 rounded-full h-8 w-8 transition-colors">
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {opsData.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic text-sm">Belum ada data operasional.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
