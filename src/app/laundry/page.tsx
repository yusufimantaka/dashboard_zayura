"use client";

import { useState } from "react";
import { WashingMachine, Plus, Clock, CheckCircle2, User } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCard, cardContainerVariants } from "@/components/AnimatedCard";
import { CountUp } from "@/components/CountUp";

export default function LaundryPage() {
  const { laundry, residents, addLaundry, updateLaundryStatus, addTransaction, t, themeColor } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    resident_id: "",
    weight_kg: 0,
    price: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddLaundry = async () => {
    if (formData.resident_id && formData.weight_kg > 0) {
      try {
        await addLaundry({
          resident_id: formData.resident_id,
          weight_kg: formData.weight_kg,
          price: formData.price,
          status: 'process',
          date: formData.date
        });

        await addTransaction({
          type: 'income',
          category: 'Laundry',
          amount: formData.price,
          date: formData.date,
          description: `Laundry - ${residents.find(r => r.id === formData.resident_id)?.full_name}`
        });

        setIsDialogOpen(false);
        setFormData({
          resident_id: "",
          weight_kg: 0,
          price: 0,
          date: new Date().toISOString().split('T')[0]
        });
      } catch (error) {
        console.error(error);
        alert("Gagal menambah pesanan laundry.");
      }
    }
  };

  const getResidentName = (id: string) => {
    return residents.find(r => r.id === id)?.full_name || "-";
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('laundry_title')}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">{t('laundry_subtitle')}</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-10 px-4 text-[10px] sm:text-xs font-semibold shadow-sm w-full sm:w-auto">
              <Plus size={18} className="mr-2" />
              {t('new_order')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Input Pesanan Laundry</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{t('residents')}</Label>
                <Select onValueChange={(val) => setFormData({...formData, resident_id: val})}>
                  <SelectTrigger><SelectValue placeholder="Pilih penghuni" /></SelectTrigger>
                  <SelectContent>
                    {residents.map(r => <SelectItem key={r.id} value={r.id}>{r.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('weight')} (kg)</Label>
                  <Input type="number" step="0.1" value={formData.weight_kg || ""} onChange={(e) => {
                    const weight = parseFloat(e.target.value);
                    setFormData({...formData, weight_kg: weight, price: weight * 10000});
                  }} />
                </div>
                <div className="grid gap-2">
                  <Label>{t('fee')} (Rp)</Label>
                  <Input type="number" value={formData.price || ""} onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>{t('date')}</Label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button onClick={handleAddLaundry}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <motion.div 
        variants={cardContainerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-3 grid-cols-2 lg:grid-cols-3"
      >
        <AnimatedCard>
          <CardContent className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">{t('process')}</p>
              <Clock size={14} className="text-amber-500" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-foreground">
                <CountUp value={laundry.filter(l => l.status === 'process').length} />
              </div>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5">{t('ongoing')}</p>
            </div>
          </CardContent>
        </AnimatedCard>
        
        <AnimatedCard>
          <CardContent className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">{t('done')}</p>
              <CheckCircle2 size={14} className="text-emerald-500" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-foreground">
                <CountUp value={laundry.filter(l => l.status === 'done').length} />
              </div>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5">{t('ready')}</p>
            </div>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard className="col-span-2 lg:col-span-1" noBackground>
          <div className={cn(
            "p-4 flex flex-row items-center justify-between min-h-[60px] h-full transition-all duration-500",
            themeColor === 'gold' ? "bg-gold-gradient text-slate-950 font-bold" : "bg-primary text-primary-foreground"
          )}>
            <div>
              <p className="text-[10px] sm:text-xs font-semibold opacity-70">Revenue</p>
              <div className="text-xl sm:text-2xl font-bold tracking-tight">
                <span>Rp </span>
                <CountUp value={laundry.reduce((acc, curr) => acc + curr.price, 0)} />
              </div>
            </div>
            <WashingMachine size={20} className="opacity-70" />
          </div>
        </AnimatedCard>
      </motion.div>

      <Card className="shadow-sm border-border overflow-hidden rounded-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-hide">
            <Table>
              <TableHeader className="bg-muted/50 border-b">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-4 px-4 font-semibold text-foreground whitespace-nowrap text-[10px]">{t('date')}</TableHead>
                  <TableHead className="py-4 px-4 font-semibold text-foreground whitespace-nowrap text-[10px]">{t('residents')}</TableHead>
                  <TableHead className="py-4 px-4 font-semibold text-foreground whitespace-nowrap text-center text-[10px]">{t('weight')}</TableHead>
                  <TableHead className="py-4 px-4 font-semibold text-foreground whitespace-nowrap text-right text-[10px]">{t('fee')}</TableHead>
                  <TableHead className="py-4 px-4 text-right font-semibold text-foreground whitespace-nowrap text-[10px]">{t('status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {laundry.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((l) => (
                  <TableRow key={l.id} className="group hover:bg-muted/50 transition-colors border-border">
                    <TableCell className="py-4 px-4 font-medium text-muted-foreground text-[10px] sm:text-xs whitespace-nowrap">{l.date}</TableCell>
                    <TableCell className="py-4 px-4 whitespace-nowrap font-bold text-foreground text-sm">{getResidentName(l.resident_id)}</TableCell>
                    <TableCell className="py-4 px-4 text-center font-bold text-foreground text-sm whitespace-nowrap">{l.weight_kg} kg</TableCell>
                    <TableCell className="py-4 px-4 text-right font-bold text-primary text-sm whitespace-nowrap">Rp {l.price.toLocaleString()}</TableCell>
                    <TableCell className="py-4 px-4 text-right whitespace-nowrap">
                      {l.status === 'process' ? (
                        <Button variant="outline" size="sm" className="h-7 text-[9px] font-semibold px-2 bg-amber-500/10 text-amber-600 border-amber-500/20" onClick={() => updateLaundryStatus(l.id, 'done')}>Set {t('done')}</Button>
                      ) : l.status === 'done' ? (
                        <Button size="sm" className="h-7 text-[9px] font-semibold px-2 bg-emerald-500 text-white" onClick={() => updateLaundryStatus(l.id, 'picked_up')}>{t('picked_up')}</Button>
                      ) : (
                        <span className="text-[9px] font-semibold text-muted-foreground">{t('picked_up')}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {laundry.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic text-sm">Belum ada data laundry.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
