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
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCard, cardContainerVariants } from "@/components/AnimatedCard";
import { CountUp } from "@/components/CountUp";
import { cn } from "@/lib/utils";

export default function OperasionalPage() {
  const { transactions, addTransaction, t, themeColor } = useData();
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
  const opsData = transactions.filter(tr => {
    const d = new Date(tr.date);
    return tr.type === 'expense' && 
           d.getMonth() === selectedMonth && 
           d.getFullYear() === selectedYear;
  });
  
  const getCategoryTotal = (cat: string) => {
    return opsData
      .filter(tr => tr.category.toLowerCase().includes(cat.toLowerCase()))
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
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('ops_title')}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">{t('ops_subtitle')}</p>
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
                {t('input_expense')}
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('input_expense')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{t('category')}</Label>
                <Select onValueChange={(val) => setFormData({...formData, category: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Listrik">Listrik</SelectItem>
                    <SelectItem value="Air">Air</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Kebersihan">Kebersihan</SelectItem>
                    <SelectItem value="Gaji Karyawan">Gaji Karyawan</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('amount')} (Rp)</Label>
                <Input 
                  type="number" 
                  placeholder="500000"
                  value={formData.amount || ""}
                  onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('description')}</Label>
                <Input 
                  placeholder="Contoh: Token listrik utama"
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
              <Button onClick={handleAddOps}>Simpan Pengeluaran</Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <motion.div 
        variants={cardContainerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-3 grid-cols-2 lg:grid-cols-5"
      >
        <AnimatedCard>
          <CardContent className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Listrik</p>
              <Zap size={14} className="text-amber-500" />
            </div>
            <div className="text-sm sm:text-lg font-bold text-foreground truncate">
              <CountUp value={getCategoryTotal('Listrik')} formatter={(v) => `Rp ${Math.floor(v).toLocaleString()}`} />
            </div>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard>
          <CardContent className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Air</p>
              <Droplets size={14} className="text-blue-500" />
            </div>
            <div className="text-sm sm:text-lg font-bold text-foreground truncate">
              <CountUp value={getCategoryTotal('Air')} formatter={(v) => `Rp ${Math.floor(v).toLocaleString()}`} />
            </div>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard>
          <CardContent className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">{t('salary')}</p>
              <Wallet size={14} className="text-emerald-500" />
            </div>
            <div className="text-sm sm:text-lg font-bold text-foreground truncate">
              <CountUp value={getCategoryTotal('Gaji')} formatter={(v) => `Rp ${Math.floor(v).toLocaleString()}`} />
            </div>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard>
          <CardContent className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">{t('repair')}</p>
              <Hammer size={14} className="text-muted-foreground" />
            </div>
            <div className="text-sm sm:text-lg font-bold text-foreground truncate">
              <CountUp value={getCategoryTotal('Maintenance')} formatter={(v) => `Rp ${Math.floor(v).toLocaleString()}`} />
            </div>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard className="col-span-2 lg:col-span-1" noBackground>
          <div className={cn(
            "p-4 flex flex-row items-center justify-between min-h-[60px] h-full transition-all duration-500",
            themeColor === 'gold' ? "bg-gold-gradient text-slate-950 font-bold" : "bg-primary text-primary-foreground"
          )}>
            <div>
              <p className="text-[10px] sm:text-xs font-semibold opacity-70">{t('total_ops')}</p>
              <div className="text-xl sm:text-2xl font-bold tracking-tight">
                <span>Rp </span>
                <CountUp value={totalOps} />
              </div>
            </div>
            <Receipt size={20} className="opacity-70" />
          </div>
        </AnimatedCard>
      </motion.div>

      <Card className="shadow-sm border-border overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-hide">
            <Table>
              <TableHeader className="bg-muted/50 border-b">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-4 px-4 font-semibold text-foreground whitespace-nowrap text-[10px]">Info Operasional</TableHead>
                  <TableHead className="py-4 px-4 font-semibold text-foreground whitespace-nowrap text-right text-[10px]">{t('amount')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((o) => (
                  <TableRow key={o.id} className="group hover:bg-muted/50 transition-colors border-border">
                    <TableCell className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] font-semibold px-1.5 py-0 bg-muted/30 border-border whitespace-nowrap">{o.category}</Badge>
                          <span className="text-[10px] text-muted-foreground font-medium">{o.date}</span>
                        </div>
                        <span className="text-xs font-bold text-foreground truncate max-w-[180px] sm:max-w-none italic">"{o.description || "-"}"</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-bold text-sm sm:text-base text-rose-600 tracking-tight">
                          - Rp {o.amount.toLocaleString()}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {opsData.length === 0 && (
                  <TableRow><TableCell colSpan={2} className="text-center py-12 text-muted-foreground italic text-sm">Belum ada data operasional.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
