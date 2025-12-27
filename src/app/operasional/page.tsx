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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Biaya Operasional</h2>
          <p className="text-sm text-muted-foreground">Monitoring pengeluaran dan pemeliharaan unit.</p>
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

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-10 px-4 shadow-sm w-full sm:w-auto">
                <Plus size={18} className="mr-2" />
                Input Pengeluaran
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Biaya Operasional</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Kategori</Label>
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
                  <Label>Jumlah (Rp)</Label>
                  <Input 
                    type="number" 
                    placeholder="500000"
                    value={formData.amount || ""}
                    onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Deskripsi</Label>
                  <Input 
                    placeholder="Contoh: Token listrik utama"
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
                <Button onClick={handleAddOps}>Simpan Pengeluaran</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Listrik</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">Rp {getCategoryTotal('Listrik').toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Air</CardTitle>
            <Droplets className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">Rp {getCategoryTotal('Air').toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Gaji Staf</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">Rp {getCategoryTotal('Gaji').toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Maintenance</CardTitle>
            <Hammer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">Rp {getCategoryTotal('Maintenance').toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border bg-foreground text-background col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-70">Total Ops</CardTitle>
            <Receipt className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">Rp {totalOps.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

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
                  <TableHead className="py-4 text-right px-6 font-bold text-foreground uppercase tracking-widest text-[10px] whitespace-nowrap">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((o) => (
                  <TableRow key={o.id} className="group hover:bg-muted/50 transition-colors border-border">
                    <TableCell className="py-4 px-6 font-medium text-muted-foreground text-sm whitespace-nowrap">{o.date}</TableCell>
                    <TableCell className="py-4 whitespace-nowrap">
                      <Badge variant="outline" className="font-semibold text-[10px] uppercase px-3 py-1 shadow-none bg-muted/30">{o.category}</Badge>
                    </TableCell>
                    <TableCell className="py-4 text-foreground font-semibold italic text-sm whitespace-nowrap">"{o.description || "-"}"</TableCell>
                    <TableCell className="py-4 font-bold text-destructive text-sm whitespace-nowrap">Rp {o.amount.toLocaleString()}</TableCell>
                    <TableCell className="py-4 text-right px-6 whitespace-nowrap">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive rounded-full transition-colors">
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {opsData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                      Belum ada data operasional di bulan ini.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
