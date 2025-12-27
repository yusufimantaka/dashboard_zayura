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

export default function LaundryPage() {
  const { laundry, residents, addLaundry, updateLaundryStatus, addTransaction } = useData();
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
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Layanan Laundry</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Monitor pesanan harian laundry.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-10 px-4 text-[10px] sm:text-xs font-semibold shadow-sm w-full sm:w-auto">
              <Plus size={18} className="mr-2" />
              Order Baru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Input Pesanan Laundry</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Penghuni</Label>
                <Select onValueChange={(val) => setFormData({...formData, resident_id: val})}>
                  <SelectTrigger><SelectValue placeholder="Pilih penghuni" /></SelectTrigger>
                  <SelectContent>
                    {residents.map(r => <SelectItem key={r.id} value={r.id}>{r.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Berat (kg)</Label>
                  <Input type="number" step="0.1" value={formData.weight_kg || ""} onChange={(e) => {
                    const weight = parseFloat(e.target.value);
                    setFormData({...formData, weight_kg: weight, price: weight * 10000});
                  }} />
                </div>
                <div className="grid gap-2">
                  <Label>Total Harga (Rp)</Label>
                  <Input type="number" value={formData.price || ""} onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Tanggal</Label>
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

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-4 pt-4 sm:px-6">
            <CardTitle className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Proses</CardTitle>
            <Clock size={14} className="text-amber-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold text-foreground">{laundry.filter(l => l.status === 'process').length}</div>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5">Ongoing</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-4 pt-4 sm:px-6">
            <CardTitle className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Selesai</CardTitle>
            <CheckCircle2 size={14} className="text-emerald-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold text-foreground">{laundry.filter(l => l.status === 'done').length}</div>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5">Ready</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border bg-foreground text-background col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-4 pt-4 sm:px-6">
            <CardTitle className="text-[10px] sm:text-xs font-semibold opacity-70">Total Revenue</CardTitle>
            <WashingMachine size={14} className="opacity-70" />
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">Rp {laundry.reduce((acc, curr) => acc + curr.price, 0).toLocaleString()}</div>
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
                  <TableHead className="py-4 font-semibold text-foreground whitespace-nowrap text-[10px]">Penghuni</TableHead>
                  <TableHead className="py-4 font-semibold text-foreground whitespace-nowrap text-center text-[10px]">Berat</TableHead>
                  <TableHead className="py-4 font-semibold text-foreground whitespace-nowrap text-right text-[10px]">Biaya</TableHead>
                  <TableHead className="py-4 text-right px-6 font-semibold text-foreground whitespace-nowrap text-[10px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {laundry.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((l) => (
                  <TableRow key={l.id} className="group hover:bg-muted/50 transition-colors border-border">
                    <TableCell className="py-5 px-6 font-medium text-muted-foreground text-[10px] sm:text-xs whitespace-nowrap">{l.date}</TableCell>
                    <TableCell className="py-5 whitespace-nowrap font-bold text-foreground text-sm">{getResidentName(l.resident_id)}</TableCell>
                    <TableCell className="py-5 text-center font-bold text-foreground text-sm whitespace-nowrap">{l.weight_kg} kg</TableCell>
                    <TableCell className="py-5 text-right font-bold text-primary text-sm whitespace-nowrap">Rp {l.price.toLocaleString()}</TableCell>
                    <TableCell className="py-5 text-right px-6 whitespace-nowrap">
                      {l.status === 'process' ? (
                        <Button variant="outline" size="sm" className="h-7 text-[9px] font-semibold px-2 bg-amber-500/10 text-amber-600 border-amber-500/20" onClick={() => updateLaundryStatus(l.id, 'done')}>Set Selesai</Button>
                      ) : l.status === 'done' ? (
                        <Button size="sm" className="h-7 text-[9px] font-semibold px-2 bg-emerald-500 text-white" onClick={() => updateLaundryStatus(l.id, 'picked_up')}>Ambil</Button>
                      ) : (
                        <span className="text-[9px] font-semibold text-muted-foreground">Diambil</span>
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
