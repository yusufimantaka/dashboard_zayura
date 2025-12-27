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
        
        <div className="flex w-full gap-2">
          <Select value={filterFloor} onValueChange={setFilterFloor}>
            <SelectTrigger className="flex-1 h-11 bg-secondary/50 rounded-xl border-border text-sm font-medium">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-muted-foreground" />
                <SelectValue placeholder="Lantai" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border">
              <SelectItem value="all">Semua Lantai</SelectItem>
              <SelectItem value="1">Lantai 01</SelectItem>
              <SelectItem value="2">Lantai 02</SelectItem>
              <SelectItem value="3">Lantai 03</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-11 px-5 rounded-xl font-semibold gap-2">
                <Plus size={18} />
                <span className="hidden sm:inline">Tambah Kamar</span>
                <span className="sm:hidden">Tambah</span>
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

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border bg-foreground text-background">
          <CardContent className="p-4 sm:p-6 flex flex-col justify-between h-full min-h-[100px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold opacity-70">Inventory</p>
              <DoorClosed className="h-4 w-4 opacity-70" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight">{rooms.length}</div>
              <p className="text-[9px] sm:text-[10px] opacity-50 font-medium mt-0.5">Unit Total</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border bg-card">
          <CardContent className="p-4 sm:p-6 flex flex-col justify-between h-full min-h-[100px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Terisi</p>
              <div className="h-2 w-2 rounded-full bg-rose-500 mt-1" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                {rooms.filter(r => r.status === 'occupied').length}
              </div>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5">Occupied</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-card">
          <CardContent className="p-4 sm:p-6 flex flex-col justify-between h-full min-h-[100px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Ready</p>
              <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                {rooms.filter(r => r.status === 'available').length}
              </div>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5">Available</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-card">
          <CardContent className="p-4 sm:p-6 flex flex-col justify-between h-full min-h-[100px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Repair</p>
              <div className="h-2 w-2 rounded-full bg-amber-500 mt-1" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                {rooms.filter(r => r.status === 'maintenance').length}
              </div>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5">Maintenance</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm bg-card overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50 border-b">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-4 px-6 font-semibold text-foreground text-xs whitespace-nowrap">Unit & Tipe</TableHead>
                  <TableHead className="py-4 font-semibold text-foreground text-xs whitespace-nowrap text-center hidden sm:table-cell">Lantai</TableHead>
                  <TableHead className="py-4 font-semibold text-foreground text-xs whitespace-nowrap text-center">Status</TableHead>
                  <TableHead className="py-4 font-semibold text-foreground text-xs whitespace-nowrap text-right pr-6">Harga</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow key={room.id} className="group hover:bg-muted/50 transition-colors border-border">
                    <TableCell className="py-5 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-base sm:text-lg">Kamar {room.room_number}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[9px] font-semibold px-1.5 py-0 bg-muted/50 border-border uppercase tracking-tighter">{room.type}</Badge>
                          <span className="text-[10px] font-semibold text-muted-foreground sm:hidden">L{room.floor}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-center whitespace-nowrap hidden sm:table-cell">
                      <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2 py-1 rounded-lg">Lantai {room.floor}</span>
                    </TableCell>
                    <TableCell className="py-5 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${room.status === 'available' ? 'bg-emerald-500' : room.status === 'occupied' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                        <span className="text-[9px] font-bold text-muted-foreground uppercase hidden sm:inline">{room.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-right pr-6 whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-foreground tracking-tight text-sm sm:text-base">Rp {room.price_per_month.toLocaleString()}</span>
                        <span className="text-[9px] text-muted-foreground font-medium">/ bulan</span>
                      </div>
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
