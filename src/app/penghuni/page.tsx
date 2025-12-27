"use client";

import { useState } from "react";
import { Users, Plus, Search, Calendar, Wallet, Receipt, Info, Camera, CreditCard, Banknote, ImageIcon, AlertCircle, CheckCircle2, History, LogOut, Trash2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { 
  Select as UISelect, 
  SelectContent as UISelectContent, 
  SelectItem as UISelectItem, 
  SelectTrigger as UISelectTrigger, 
  SelectValue as UISelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "@/context/DataContext";

export default function PenghuniPage() {
  const { residents, tenancies, rooms, invoices, transactions, addResident, addTenancy, updateRoomStatus, addInvoice, payInvoice, checkoutResident, deleteTenancy, extendTenancy } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isTransactionDetailOpen, setIsTransactionDetailOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    room_id: "",
    start_date: new Date().toISOString().split('T')[0],
    duration_months: 1,
  });

  const [paymentData, setPaymentData] = useState({
    method: "Transfer" as "Transfer" | "Cash",
    date: new Date().toISOString().split('T')[0],
    proof_image: ""
  });

  const [extendData, setExtendData] = useState({
    months: 1,
    start_date: ""
  });

  const generateInvoices = async (tenancyId: string, residentId: string, startDate: string, months: number, roomType: string, roomPrice: number) => {
    let remainingMonths = months;
    let currentDate = new Date(startDate);

    while (remainingMonths > 0) {
      let amount = 0;
      let monthsToInvoice = 1;
      let desc = "";

      if (remainingMonths >= 3) {
        // Paket 3 bulan
        monthsToInvoice = 3;
        const discountPrice = roomType === 'Small' ? 1900000 : roomType === 'Medium' ? 2000000 : 2100000;
        amount = discountPrice * 3;
        desc = `Paket 3 Bulan (${roomType} - Rp ${discountPrice.toLocaleString()}/bln)`;
      } else {
        // Paket bulanan biasa
        monthsToInvoice = 1;
        amount = roomPrice;
        desc = `Sewa Bulanan (${roomType} - Rp ${roomPrice.toLocaleString()}/bln)`;
      }

      const monthName = currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
      
      const periodStart = new Date(currentDate);
      const periodEnd = new Date(currentDate);
      periodEnd.setMonth(periodEnd.getMonth() + monthsToInvoice);

      await addInvoice({
        tenancy_id: tenancyId,
        resident_id: residentId,
        month_year: monthName,
        amount: amount,
        status: 'unpaid',
        due_date: currentDate.toISOString().split('T')[0],
        description: desc,
        period_start: periodStart.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0]
      });

      currentDate.setMonth(currentDate.getMonth() + monthsToInvoice);
      remainingMonths -= monthsToInvoice;
    }
  };

  const handleAddResident = async () => {
    const duration = formData.duration_months || 1;
    if (formData.full_name && formData.phone_number && formData.room_id) {
      try {
        const room = rooms.find(r => r.id === formData.room_id);
        if (!room) return;

        const resId = await addResident({
          full_name: formData.full_name,
          phone_number: formData.phone_number
        });

        const exitDate = new Date(formData.start_date);
        exitDate.setMonth(exitDate.getMonth() + duration);

        const tenancyId = await addTenancy({
          resident_id: resId,
          room_id: formData.room_id,
          start_date: formData.start_date,
          expected_end_date: exitDate.toISOString().split('T')[0],
          status: 'active'
        });

        await updateRoomStatus(formData.room_id, 'occupied');
        await generateInvoices(tenancyId, resId, formData.start_date, duration, room.type, room.price_per_month);

        setIsDialogOpen(false);
        setFormData({ full_name: "", phone_number: "", room_id: "", start_date: new Date().toISOString().split('T')[0], duration_months: 1 });
      } catch (error) {
        console.error(error);
        alert("Gagal memproses check-in.");
      }
    } else {
      alert("Mohon isi semua data (Nama, No. Telepon, dan Kamar)");
    }
  };

  const handleExtend = async () => {
    if (selectedResident && extendData.months > 0) {
      try {
        const room = rooms.find(r => r.id === selectedResident.room_id);
        if (!room) return;

        // Hitung tanggal akhir baru
        const newExitDate = new Date(extendData.start_date);
        newExitDate.setMonth(newExitDate.getMonth() + extendData.months);
        const newExitDateStr = newExitDate.toISOString().split('T')[0];

        // Update tenancy expected_end_date
        await extendTenancy(selectedResident.id, newExitDateStr);

        // Tambah tagihan baru
        await generateInvoices(
          selectedResident.id, 
          selectedResident.resident_id, 
          extendData.start_date, 
          extendData.months, 
          room.type, 
          room.price_per_month
        );

        setIsExtendDialogOpen(false);
        setExtendData({ months: 1, start_date: "" });
      } catch (error) {
        console.error(error);
        alert("Gagal memperpanjang sewa.");
      }
    }
  };

  const handlePayInvoice = async () => {
    if (selectedInvoice && selectedResident) {
      try {
        await payInvoice(selectedInvoice.id, {
          type: 'income',
          category: 'Sewa Kamar',
          amount: selectedInvoice.amount,
          date: paymentData.date,
          description: `Pelunasan: ${selectedInvoice.description} - ${selectedInvoice.month_year} (${selectedResident.resident_name})`,
          payment_method: paymentData.method,
          proof_image: paymentData.method === 'Transfer' ? paymentData.proof_image : undefined
        });
        setIsPaymentDialogOpen(false);
        setSelectedInvoice(null);
        // Reset payment data
        setPaymentData({
          method: "Transfer",
          date: new Date().toISOString().split('T')[0],
          proof_image: ""
        });
      } catch (error) {
        console.error(error);
        alert("Gagal memproses pembayaran.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentData(prev => ({ ...prev, proof_image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckout = async (tenancyId: string) => {
    if (confirm("Apakah anda yakin ingin melakukan check-out penghuni ini? Status akan pindah ke Riwayat.")) {
      try {
        await checkoutResident(tenancyId);
        setIsDetailOpen(false);
      } catch (error) {
        console.error(error);
        alert("Gagal memproses check-out.");
      }
    }
  };

  const handleDelete = async (tenancyId: string) => {
    if (confirm("Hapus data dari riwayat? Tindakan ini tidak dapat dibatalkan.")) {
      try {
        await deleteTenancy(tenancyId);
      } catch (error) {
        console.error(error);
        alert("Gagal menghapus data.");
      }
    }
  };

  const getResidentInvoices = (residentId: string) => {
    return invoices.filter(inv => inv.resident_id === residentId);
  };

  const mapTenancyData = (t: any) => {
    const res = residents.find(r => r.id === t.resident_id);
    const room = rooms.find(rm => rm.id === t.room_id);
    const resInvoices = invoices.filter(inv => inv.resident_id === t.resident_id);
    const hasUnpaid = resInvoices.some(inv => inv.status === 'unpaid');

    return { 
      ...t, 
      resident_name: res?.full_name, 
      phone: res?.phone_number, 
      room_number: room?.room_number,
      room_type: room?.type,
      floor: room?.floor,
      hasUnpaid
    };
  };

  const activeResidents = tenancies.filter(t => t.status === 'active').map(mapTenancyData);
  const historyResidents = tenancies.filter(t => t.status === 'completed').map(mapTenancyData);

  const displayList = (activeTab === 'active' ? activeResidents : historyResidents)
    .filter(item => 
      item.resident_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.room_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const openDetail = (resident: any) => {
    setSelectedResident(resident);
    setIsDetailOpen(true);
  };

  const openExtend = (resident: any) => {
    const resInvoices = getResidentInvoices(resident.resident_id);
    const lastInvoice = [...resInvoices].sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())[0];
    
    let nextDate = new Date(resident.start_date);
    if (lastInvoice) {
      nextDate = new Date(lastInvoice.due_date);
      // Logic simplified: assume next month
      nextDate.setMonth(nextDate.getMonth() + (lastInvoice.description.includes('Paket 3') ? 3 : 1));
    }

    setExtendData({ months: 1, start_date: nextDate.toISOString().split('T')[0] });
    setSelectedResident(resident);
    setIsExtendDialogOpen(true);
  };

  const openPayment = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsPaymentDialogOpen(true);
  };

  const openTransactionDetail = (invoiceId: string) => {
    const transaction = transactions.find(t => t.invoice_id === invoiceId);
    if (transaction) {
      setSelectedTransaction(transaction);
      setIsTransactionDetailOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Data Penghuni</h2>
          <p className="text-sm text-muted-foreground">Manajemen residen dan status pembayaran.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-10 px-4">
              <Plus size={18} className="mr-2" />
              Check-in Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Check-in Penghuni Baru</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Nama Lengkap</Label><Input value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} /></div>
              <div className="grid gap-2"><Label>No. Telepon</Label><Input value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} /></div>
              <div className="grid gap-2"><Label>Pilih Kamar</Label>
                <UISelect onValueChange={(val) => setFormData({...formData, room_id: val})}>
                  <UISelectTrigger><UISelectValue placeholder="Pilih kamar tersedia" /></UISelectTrigger>
                  <UISelectContent>
                    {[1, 2, 3].map(floor => (
                      <div key={floor}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-slate-50">Lantai {floor}</div>
                        {rooms.filter(r => r.floor === floor && r.status === 'available').map(room => (
                          <UISelectItem key={room.id} value={room.id}>Kamar {room.room_number} ({room.type})</UISelectItem>
                        ))}
                      </div>
                    ))}
                  </UISelectContent>
                </UISelect>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>Tgl Masuk</Label><Input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} /></div>
                <div className="grid gap-2"><Label>Durasi (Bulan)</Label><Input type="number" min="1" value={formData.duration_months} onChange={(e) => setFormData({...formData, duration_months: parseInt(e.target.value)})} /></div>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button><Button onClick={handleAddResident}>Proses</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="bg-secondary/30 p-1 border border-border/50 h-10 w-full sm:w-auto">
            <TabsTrigger value="active" className="flex-1 sm:flex-none flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs font-bold uppercase tracking-widest"><Users size={16} /> Aktif</TabsTrigger>
            <TabsTrigger value="history" className="flex-1 sm:flex-none flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs font-bold uppercase tracking-widest"><History size={16} /> Riwayat</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input className="pl-10 h-10 bg-background border-border shadow-sm focus:ring-primary/20" placeholder="Cari nama/kamar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <Card className="border-border shadow-sm bg-card overflow-hidden rounded-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="py-4 px-6 font-bold text-foreground uppercase tracking-widest text-[10px] whitespace-nowrap">Nama Penghuni</TableHead>
                      <TableHead className="py-4 font-bold text-foreground uppercase tracking-widest text-[10px] whitespace-nowrap">Kamar</TableHead>
                      <TableHead className="py-4 font-bold text-foreground uppercase tracking-widest text-[10px] whitespace-nowrap">Status Tagihan</TableHead>
                      <TableHead className="py-4 font-bold text-foreground uppercase tracking-widest text-[10px] whitespace-nowrap">No. Telepon</TableHead>
                      <TableHead className="py-4 font-bold text-foreground uppercase tracking-widest text-[10px] whitespace-nowrap">Masuk</TableHead>
                      <TableHead className="py-4 font-bold text-foreground uppercase tracking-widest text-[10px] whitespace-nowrap">Keluar (Estimasi)</TableHead>
                      <TableHead className="py-4 text-right px-6 font-bold text-foreground uppercase tracking-widest text-[10px] whitespace-nowrap">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayList.map((item) => (
                      <TableRow key={item.id} className="group hover:bg-muted/50 transition-colors border-border">
                        <TableCell className="py-4 px-6 font-bold text-foreground tracking-tight whitespace-nowrap">{item.resident_name}</TableCell>
                        <TableCell className="py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{item.room_number}</span>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">{item.room_type} Unit</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 whitespace-nowrap">
                          {item.hasUnpaid ? (
                            <Badge variant="destructive" className="font-semibold shadow-none text-[10px] uppercase">Ada Tunggakan</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 font-semibold shadow-none text-[10px] uppercase">Lunas</Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-4 text-sm text-muted-foreground whitespace-nowrap">{item.phone}</TableCell>
                        <TableCell className="py-4 text-sm text-muted-foreground whitespace-nowrap">{item.start_date}</TableCell>
                        <TableCell className="py-4 text-sm font-semibold text-destructive whitespace-nowrap">{item.expected_end_date}</TableCell>
                        <TableCell className="py-4 text-right px-6 whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openDetail(item)} className="h-8 font-semibold text-[10px] uppercase">Tagihan</Button>
                            {activeTab === 'active' ? (
                              <Button variant="ghost" size="sm" onClick={() => handleCheckout(item.id)} className="text-muted-foreground hover:text-destructive transition-colors"><LogOut size={16} /></Button>
                            ) : (
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={16} /></Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {displayList.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground italic">Tidak ada data ditemukan.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Tagihan */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <div className="p-6 border-b bg-slate-50/50">
            <div className="flex justify-between items-start">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2"><Receipt className="text-blue-600" /> Tagihan: {selectedResident?.resident_name}</DialogTitle>
                <div className="flex gap-4 mt-2">
                  <div className="text-sm"><span className="text-muted-foreground">Kamar:</span> <span className="font-semibold">{selectedResident?.room_number}</span></div>
                  <div className="text-sm"><span className="text-muted-foreground">Lantai:</span> <span className="font-semibold">{selectedResident?.floor}</span></div>
                </div>
              </DialogHeader>
              {activeTab === 'active' && (
                <Button onClick={() => openExtend(selectedResident)} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus size={16} className="mr-2" /> Extend / Tambah Tagihan
                </Button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow><TableHead>Periode Sewa</TableHead><TableHead>Keterangan</TableHead><TableHead>Jatuh Tempo</TableHead><TableHead>Jumlah</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {getResidentInvoices(selectedResident?.resident_id).map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-bold">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">{inv.month_year}</span>
                          <span className="text-sm">{inv.period_start} s/d {inv.period_end}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{inv.description}</TableCell>
                      <TableCell className="text-sm text-slate-500">{inv.due_date}</TableCell>
                      <TableCell className="font-bold">Rp {inv.amount.toLocaleString()}</TableCell>
                      <TableCell><Badge className={inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-50 text-rose-700'}>{inv.status === 'paid' ? 'Lunas' : 'Belum Bayar'}</Badge></TableCell>
                      <TableCell className="text-right">
                        {inv.status === 'unpaid' ? (
                          <Button size="sm" onClick={() => openPayment(inv)}>Bayar</Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 gap-2"
                            onClick={() => openTransactionDetail(inv.id)}
                          >
                            <CheckCircle2 size={14} /> Detail Bayar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="p-4 border-t bg-slate-50 flex justify-between">
            {activeTab === 'history' && (
              <Button variant="destructive" onClick={() => handleDelete(selectedResident.id)}><Trash2 size={16} className="mr-2" /> Hapus Permanen</Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Tutup</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Extend */}
      <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Extend Sewa / Tambah Tagihan</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-600 font-bold uppercase mb-1">Mulai Perpanjangan Dari</p>
              <p className="text-lg font-bold text-blue-900">{extendData.start_date}</p>
              <p className="text-[10px] text-blue-500 mt-1">*Otomatis mengikuti tanggal keluar sebelumnya</p>
            </div>
            <div className="grid gap-2">
              <Label>Tambah Durasi (Bulan)</Label>
              <Input 
                type="number" 
                min="1" 
                value={extendData.months} 
                onChange={(e) => setExtendData({...extendData, months: parseInt(e.target.value)})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExtendDialogOpen(false)}>Batal</Button>
            <Button onClick={handleExtend} className="bg-emerald-600 hover:bg-emerald-700">
              Tambah Tagihan Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Bayar Tagihan (Tetap sama) */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Pelunasan Tagihan</DialogTitle></DialogHeader>
          {selectedInvoice && (
            <div className="grid gap-4 py-4">
              <div className="bg-slate-50 p-4 rounded-lg border">
                <p className="text-xs text-muted-foreground">Tagihan Untuk</p>
                <p className="font-bold">{selectedInvoice.description} - {selectedInvoice.month_year}</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">Rp {selectedInvoice.amount.toLocaleString()}</p>
              </div>
              <div className="grid gap-2"><Label>Metode</Label>
                <UISelect value={paymentData.method} onValueChange={(val: any) => setPaymentData({...paymentData, method: val})}><UISelectTrigger><UISelectValue /></UISelectTrigger><UISelectContent><UISelectItem value="Transfer">Transfer</UISelectItem><UISelectItem value="Cash">Cash</UISelectItem></UISelectContent></UISelect>
              </div>
              {paymentData.method === 'Transfer' && (
                <div className="grid gap-2">
                  <Label>Upload Bukti</Label>
                  <Input type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer" />
                  {paymentData.proof_image && (
                    <div className="mt-2 relative w-full h-32 border rounded-lg overflow-hidden bg-slate-100">
                      <img src={paymentData.proof_image} className="w-full h-full object-contain" alt="Preview" />
                    </div>
                  )}
                </div>
              )}
              <div className="grid gap-2"><Label>Tanggal Bayar</Label><Input type="date" value={paymentData.date} onChange={(e) => setPaymentData({...paymentData, date: e.target.value})} /></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Batal</Button><Button onClick={handlePayInvoice}>Konfirmasi Pelunasan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Detail Pembayaran / Invoice */}
      <Dialog open={isTransactionDetailOpen} onOpenChange={setIsTransactionDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt size={20} className="text-blue-600" />
              Detail Pembayaran
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6 py-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Status</span>
                  <Badge className="bg-emerald-500">Lunas</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tanggal Bayar</span>
                  <span className="text-sm font-semibold">{selectedTransaction.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Metode</span>
                  <span className="text-sm font-semibold">{selectedTransaction.payment_method}</span>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Jumlah Dibayar</p>
                  <p className="text-2xl font-black text-blue-600">Rp {selectedTransaction.amount.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Keterangan</Label>
                <p className="text-sm bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                  "{selectedTransaction.description}"
                </p>
              </div>

              {selectedTransaction.proof_image && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Bukti Transfer</Label>
                  <div className="border rounded-xl overflow-hidden bg-slate-100 shadow-inner group relative cursor-pointer" onClick={() => window.open(selectedTransaction.proof_image, '_blank')}>
                    <img 
                      src={selectedTransaction.proof_image} 
                      alt="Bukti Pembayaran" 
                      className="w-full h-auto max-h-64 object-contain transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-xs font-bold flex items-center gap-2">
                        <ImageIcon size={16} /> Klik untuk Perbesar
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="w-full" onClick={() => setIsTransactionDetailOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
