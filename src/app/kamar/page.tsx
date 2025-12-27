"use client";

import { useState } from "react";
import { DoorClosed, Plus, MoreVertical, Filter, Trash2 } from "lucide-react";
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

export default function KamarPage() {
  const { rooms, addRoom, residents, tenancies } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterFloor, setFilterFloor] = useState<string>("all");
  
  const [newRoom, setNewRoom] = useState({ 
    room_number: "", 
    price_per_month: 2100000, 
    floor: 1, 
    type: 'Medium' as 'Small' | 'Medium' | 'Large' 
  });

  const handleAddRoom = async () => {
    if (newRoom.room_number && newRoom.price_per_month > 0) {
      try {
        await addRoom({
          room_number: newRoom.room_number,
          price_per_month: newRoom.price_per_month,
          floor: newRoom.floor,
          type: newRoom.type,
          status: 'available'
        });
        setIsDialogOpen(false);
        setNewRoom({ room_number: "", price_per_month: 2100000, floor: 1, type: 'Medium' });
      } catch (error) {
        console.error(error);
        alert("Gagal menambah kamar.");
      }
    }
  };

  const getResidentName = (roomId: string) => {
    const tenancy = tenancies.find(t => t.room_id === roomId && t.status === 'active');
    if (!tenancy) return "-";
    const resident = residents.find(r => r.id === tenancy.resident_id);
    return resident ? resident.full_name : "-";
  };

  const filteredRooms = rooms.filter(r => 
    filterFloor === "all" ? true : r.floor === parseInt(filterFloor)
  ).sort((a, b) => a.room_number.localeCompare(b.room_number));

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'occupied': return 'default';
      case 'available': return 'secondary';
      case 'maintenance': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Inventory Kamar</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Manajemen unit dan aset hunian.</p>
        </div>
        
        <div className="flex w-full sm:w-auto gap-2">
          <Select value={filterFloor} onValueChange={setFilterFloor}>
            <SelectTrigger className="flex-1 sm:w-[160px] h-10 bg-secondary/50 rounded-md border-border text-[10px] sm:text-xs font-semibold">
              <Filter size={14} className="mr-2 text-muted-foreground" />
              <SelectValue placeholder="Lantai" />
            </SelectTrigger>
            <SelectContent className="rounded-md border-border">
              <SelectItem value="all">Semua Lantai</SelectItem>
              <SelectItem value="1">Lantai 01</SelectItem>
              <SelectItem value="2">Lantai 02</SelectItem>
              <SelectItem value="3">Lantai 03</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex-none sm:flex-1 h-10 px-4 text-[10px] sm:text-xs font-semibold">
                <Plus size={16} className="mr-2" />
                Tambah
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Kamar Baru</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Nomor Kamar</Label>
                    <Input 
                      placeholder="101" 
                      value={newRoom.room_number}
                      onChange={(e) => setNewRoom({ ...newRoom, room_number: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Lantai</Label>
                    <Select value={newRoom.floor.toString()} onValueChange={(v) => setNewRoom({...newRoom, floor: parseInt(v)})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Lantai 1</SelectItem>
                        <SelectItem value="2">Lantai 2</SelectItem>
                        <SelectItem value="3">Lantai 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tipe Kamar</Label>
                    <Select value={newRoom.type} onValueChange={(v: any) => {
                      let price = 2100000;
                      if(v === 'Small') price = 2000000;
                      if(v === 'Large') price = 2200000;
                      setNewRoom({...newRoom, type: v, price_per_month: price});
                    }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Small">Small</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Harga / Bulan</Label>
                    <Input 
                      type="number" 
                      value={newRoom.price_per_month}
                      onChange={(e) => setNewRoom({ ...newRoom, price_per_month: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                <Button onClick={handleAddRoom}>Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border bg-foreground text-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-4 pt-4 sm:px-6">
            <CardTitle className="text-[10px] sm:text-xs font-semibold opacity-70">Inventory</CardTitle>
            <DoorClosed className="h-3.5 w-3.5 sm:h-4 sm:w-4 opacity-70" />
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold tracking-tight">{rooms.length}</div>
            <p className="text-[9px] sm:text-[10px] opacity-50 font-medium mt-0.5">Unit Total</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-4 pt-4 sm:px-6">
            <CardTitle className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Terisi</CardTitle>
            <div className="h-2 w-2 rounded-full bg-rose-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold tracking-tight">
              {rooms.filter(r => r.status === 'occupied').length}
            </div>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5">Occupied</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-4 pt-4 sm:px-6">
            <CardTitle className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Ready</CardTitle>
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold tracking-tight">
              {rooms.filter(r => r.status === 'available').length}
            </div>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5">Available</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 px-4 pt-4 sm:px-6">
            <CardTitle className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Repair</CardTitle>
            <div className="h-2 w-2 rounded-full bg-amber-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold tracking-tight">
              {rooms.filter(r => r.status === 'maintenance').length}
            </div>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5">Maintenance</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm bg-card overflow-hidden rounded-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-4 px-6 font-semibold text-foreground whitespace-nowrap">No. Kamar</TableHead>
                  <TableHead className="py-4 font-semibold text-foreground whitespace-nowrap text-center">Lantai</TableHead>
                  <TableHead className="py-4 font-semibold text-foreground whitespace-nowrap text-center">Tipe</TableHead>
                  <TableHead className="py-4 font-semibold text-foreground whitespace-nowrap text-center">Status</TableHead>
                  <TableHead className="py-4 font-semibold text-foreground whitespace-nowrap">Harga</TableHead>
                  <TableHead className="py-4 text-right px-6 font-semibold text-foreground whitespace-nowrap">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow key={room.id} className="group hover:bg-muted/50 transition-colors border-border">
                    <TableCell className="py-5 px-6 font-bold text-foreground text-base sm:text-lg whitespace-nowrap">{room.room_number}</TableCell>
                    <TableCell className="py-5 text-center whitespace-nowrap">
                      <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground bg-secondary px-2 py-1 rounded-full">L{room.floor}</span>
                    </TableCell>
                    <TableCell className="py-5 text-center whitespace-nowrap">
                      <Badge variant="outline" className="text-[9px] font-semibold px-2 py-0.5 bg-muted/50 border-border">{room.type}</Badge>
                    </TableCell>
                    <TableCell className="py-5 text-center whitespace-nowrap">
                      <div className={`mx-auto w-2 h-2 rounded-full ${room.status === 'available' ? 'bg-emerald-500' : room.status === 'occupied' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                    </TableCell>
                    <TableCell className="py-5 font-bold text-foreground tracking-tight text-xs sm:text-sm whitespace-nowrap">Rp {room.price_per_month.toLocaleString()}</TableCell>
                    <TableCell className="py-5 text-right px-6 whitespace-nowrap">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-full">
                        <MoreVertical size={14} className="text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
