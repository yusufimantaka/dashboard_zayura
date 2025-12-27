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

        // Juga masukkan ke transaksi sebagai pemasukan (opsional, bisa saat lunas/picked_up)
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

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'process': return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold text-[10px] uppercase">Proses</Badge>;
      case 'done': return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold text-[10px] uppercase">Selesai</Badge>;
      case 'picked_up': return <Badge variant="outline" className="text-muted-foreground border-border font-bold text-[10px] uppercase">Diambil</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Layanan Laundry</h2>
          <p className="text-sm text-muted-foreground">Monitor pesanan dan omzet harian laundry.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-10 px-4 shadow-sm">
              <Plus size={18} className="mr-2" />
              Order Baru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Input Pesanan Laundry</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Penghuni</Label>
                <Select onValueChange={(val) => setFormData({...formData, resident_id: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih penghuni" />
                  </SelectTrigger>
                  <SelectContent>
                    {residents.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Berat (kg)</Label>
                  <Input 
                    type="number" 
                    step="0.1"
                    placeholder="2.5"
                    value={formData.weight_kg || ""}
                    onChange={(e) => {
                      const weight = parseFloat(e.target.value);
                      setFormData({...formData, weight_kg: weight, price: weight * 10000}); // Misal 10rb/kg
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Total Harga (Rp)</Label>
                  <Input 
                    type="number" 
                    value={formData.price || ""}
                    onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                  />
                </div>
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
              <Button onClick={handleAddLaundry}>Simpan Order</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Proses</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">{laundry.filter(l => l.status === 'process').length}</div>
            <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-tight">Ongoing</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Selesai</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">{laundry.filter(l => l.status === 'done').length}</div>
            <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-tight">Ready</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border bg-foreground text-background col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-70">Omzet Laundry</CardTitle>
            <WashingMachine className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">Rp {laundry.reduce((acc, curr) => acc + curr.price, 0).toLocaleString()}</div>
            <p className="text-[10px] opacity-50 font-medium mt-1 uppercase tracking-tight italic">All Time Revenue</p>
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
                  <TableHead className="py-4 font-bold text-foreground uppercase tracking-widest text-[10px] whitespace-nowrap">Nama Penghuni</TableHead>
                  <TableHead className="py-4 font-bold text-foreground uppercase tracking-widest text-[10px] whitespace-nowrap">Berat</TableHead>
                  <TableHead className="py-4 font-bold text-foreground uppercase tracking-widest text-[10px] whitespace-nowrap">Biaya</TableHead>
                  <TableHead className="py-4 font-bold text-foreground uppercase tracking-widest text-[10px] whitespace-nowrap">Status</TableHead>
                  <TableHead className="py-4 text-right px-6 font-bold text-foreground uppercase tracking-widest text-[10px] whitespace-nowrap">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {laundry.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((l) => (
                  <TableRow key={l.id} className="group hover:bg-muted/50 transition-colors border-border">
                    <TableCell className="py-4 px-6 font-medium text-muted-foreground text-sm whitespace-nowrap">{l.date}</TableCell>
                    <TableCell className="py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                        {getResidentName(l.resident_id)}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 font-bold text-foreground text-sm whitespace-nowrap">{l.weight_kg} kg</TableCell>
                    <TableCell className="py-4 font-bold text-foreground text-sm tracking-tight text-primary whitespace-nowrap">Rp {l.price.toLocaleString()}</TableCell>
                    <TableCell className="py-4 whitespace-nowrap">{getStatusBadge(l.status)}</TableCell>
                    <TableCell className="py-4 text-right px-6 whitespace-nowrap">
                      {l.status === 'process' && (
                        <Button variant="outline" size="sm" className="h-8 font-bold text-[10px] uppercase tracking-tighter" onClick={async () => {
                          try {
                            await updateLaundryStatus(l.id, 'done');
                          } catch (error) {
                            console.error(error);
                            alert("Gagal update status.");
                          }
                        }}>Set Selesai</Button>
                      )}
                      {l.status === 'done' && (
                        <Button size="sm" className="h-8 font-bold text-[10px] uppercase tracking-tighter" onClick={async () => {
                          try {
                            await updateLaundryStatus(l.id, 'picked_up');
                          } catch (error) {
                            console.error(error);
                            alert("Gagal update status.");
                          }
                        }}>Ambil Barang</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {laundry.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                      Belum ada data laundry.
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
