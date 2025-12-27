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
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCard, cardContainerVariants } from "@/components/AnimatedCard";
import { CountUp } from "@/components/CountUp";

export default function PenghuniPage() {
  const { residents, tenancies, rooms, invoices, transactions, addResident, addTenancy, updateRoomStatus, addInvoice, payInvoice, checkoutResident, deleteTenancy, extendTenancy, refreshData, t, themeColor } = useData();
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
    profession: "",
    emergency_contact: "",
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
        monthsToInvoice = 3;
        const discountPrice = roomType === 'Small' ? 1900000 : roomType === 'Medium' ? 2000000 : 2100000;
        amount = discountPrice * 3;
        desc = `Paket 3 Bulan (${roomType} - Rp ${discountPrice.toLocaleString()}/bln)`;
      } else {
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
          phone_number: formData.phone_number,
          profession: formData.profession,
          emergency_contact: formData.emergency_contact
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

        await refreshData(); // Refresh data untuk memastikan status kamar terupdate
        setIsDialogOpen(false);
        setFormData({ 
          full_name: "", 
          phone_number: "", 
          profession: "",
          emergency_contact: "",
          room_id: "", 
          start_date: new Date().toISOString().split('T')[0], 
          duration_months: 1 
        });
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

        const newExitDate = new Date(extendData.start_date);
        newExitDate.setMonth(newExitDate.getMonth() + extendData.months);
        const newExitDateStr = newExitDate.toISOString().split('T')[0];

        await extendTenancy(selectedResident.id, newExitDateStr);
        await generateInvoices(selectedResident.id, selectedResident.resident_id, extendData.start_date, extendData.months, room.type, room.price_per_month);

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
        setPaymentData({ method: "Transfer", date: new Date().toISOString().split('T')[0], proof_image: "" });
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
    if (confirm("Apakah anda yakin ingin melakukan check-out penghuni ini?")) {
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
    if (confirm("Hapus data dari riwayat?")) {
      try {
        await deleteTenancy(tenancyId);
      } catch (error) {
        console.error(error);
        alert("Gagal menghapus data.");
      }
    }
  };

  const getResidentInvoices = (residentId: string) => invoices.filter(inv => inv.resident_id === residentId);

  const mapTenancyData = (tr: any) => {
    const res = residents.find(r => r.id === tr.resident_id);
    const room = rooms.find(rm => rm.id === tr.room_id);
    const resInvoices = invoices.filter(inv => inv.resident_id === tr.resident_id);
    const hasUnpaid = resInvoices.some(inv => inv.status === 'unpaid');

    return { 
      ...tr, 
      resident_name: res?.full_name, 
      phone: res?.phone_number, 
      profession: res?.profession,
      emergency_contact: res?.emergency_contact,
      room_number: room?.room_number,
      room_type: room?.type,
      floor: room?.floor,
      hasUnpaid
    };
  };

  const activeResidents = tenancies.filter(tr => tr.status === 'active').map(mapTenancyData);
  const historyResidents = tenancies.filter(tr => tr.status === 'completed').map(mapTenancyData);

  const displayList = (activeTab === 'active' ? activeResidents : historyResidents)
    .filter(item => 
      item.resident_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.room_number?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

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
    const transaction = transactions.find(tr => tr.invoice_id === invoiceId);
    if (transaction) {
      setSelectedTransaction(transaction);
      setIsTransactionDetailOpen(true);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('residents_title')}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">{t('residents_subtitle')}</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto h-10 px-4 text-[10px] sm:text-xs font-semibold">
              <Plus size={18} className="mr-2" />
              {t('checkin_new')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{t('checkin_new')}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{t('resident_info')}</Label>
                <div className="grid gap-2">
                  <Input placeholder="Nama Lengkap" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
                  <Input placeholder={t('phone_number')} value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} />
                  <Input placeholder={t('profession')} value={formData.profession} onChange={(e) => setFormData({...formData, profession: e.target.value})} />
                  <Input placeholder={t('emergency_contact')} value={formData.emergency_contact} onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})} />
                </div>
              </div>
              <div className="grid gap-2"><Label>Pilih Kamar</Label>
                <UISelect onValueChange={(val) => setFormData({...formData, room_id: val})}>
                  <UISelectTrigger><UISelectValue placeholder="Pilih kamar tersedia" /></UISelectTrigger>
                  <UISelectContent>
                    {[1, 2, 3].map(floor => (
                      <div key={floor}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">Lantai {floor}</div>
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

      <motion.div 
        variants={cardContainerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-3 grid-cols-2 lg:grid-cols-4"
      >
        <AnimatedCard>
          <div className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">{t('active')}</p>
              <Users size={14} className="text-emerald-500" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight">
                <CountUp value={activeResidents.length} />
              </div>
              <p className="text-[9px] text-muted-foreground font-medium">Residents</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <div className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">{t('history')}</p>
              <History size={14} className="text-muted-foreground" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight">
                <CountUp value={historyResidents.length} />
              </div>
              <p className="text-[9px] text-muted-foreground font-medium">Ex-Residents</p>
            </div>
          </div>
        </AnimatedCard>
      </motion.div>

      <Tabs defaultValue="active" onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col gap-4">
          <TabsList className="bg-secondary/30 p-1 border border-border/50 h-11 w-full max-w-[400px]">
            <TabsTrigger value="active" className="flex-1 flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm text-[10px] sm:text-xs font-semibold px-4"><Users size={14} /> {t('active')}</TabsTrigger>
            <TabsTrigger value="history" className="flex-1 flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm text-[10px] sm:text-xs font-semibold px-4"><History size={14} /> {t('history')}</TabsTrigger>
          </TabsList>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input className="pl-10 h-11 bg-background border-border shadow-sm focus:ring-primary/20 text-sm" placeholder={t('search_placeholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <Card className="border-border shadow-sm bg-card overflow-hidden rounded-2xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto scrollbar-hide">
                <Table>
                  <TableHeader className="bg-muted/50 border-b">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="py-4 px-4 font-semibold text-foreground whitespace-nowrap text-[10px]">{t('resident_info')}</TableHead>
                      <TableHead className="py-4 px-4 font-semibold text-foreground whitespace-nowrap text-center text-[10px]">{t('bill')}</TableHead>
                      <TableHead className="py-4 px-4 font-semibold text-foreground whitespace-nowrap text-right text-[10px]">{t('action')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayList.map((item) => (
                      <TableRow key={item.id} className="group hover:bg-muted/50 transition-colors border-border">
                        <TableCell className="py-4 px-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className={cn(
                              "font-bold text-sm sm:text-base transition-all duration-300",
                              themeColor === 'gold' ? "text-gold-gradient" : "text-foreground"
                            )}>
                              {item.resident_name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-bold text-muted-foreground">{t('rooms')} {item.room_number}</span>
                              <span className="text-[10px] font-semibold text-muted-foreground bg-secondary px-1.5 py-0 rounded uppercase tracking-tighter">L{item.floor}</span>
                              {item.profession && (
                                <span className="text-[10px] font-medium text-muted-foreground/70 border-l border-border pl-2 italic">{item.profession}</span>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium mt-1">{t('checkout')}: {item.expected_end_date}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {item.hasUnpaid ? (
                              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            )}
                            <span className="text-[9px] font-bold text-muted-foreground uppercase">{item.hasUnpaid ? t('bill') : t('paid')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex flex-col items-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openDetail(item)} className="h-8 text-[10px] font-semibold px-3 bg-secondary/50 rounded-lg">{t('detail')}</Button>
                            {activeTab === 'active' ? (
                              <Button variant="ghost" size="sm" onClick={() => handleCheckout(item.id)} className="text-muted-foreground hover:text-rose-500 transition-colors h-7 w-7 p-0 rounded-full"><LogOut size={14} /></Button>
                            ) : (
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:text-rose-500 transition-colors h-7 w-7 p-0 rounded-full"><Trash2 size={14} /></Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {displayList.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-12 text-muted-foreground italic text-sm">Tidak ada data ditemukan.</TableCell></TableRow>}
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
          <div className="p-6 border-b bg-muted/20">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2"><Receipt className="text-primary" /> {t('bill')}: {selectedResident?.resident_name}</DialogTitle>
                <div className="flex gap-4 mt-2">
                  <div className="text-xs sm:text-sm"><span className="text-muted-foreground">{t('unit')}:</span> <span className="font-semibold">{selectedResident?.room_number}</span></div>
                  <div className="text-xs sm:text-sm"><span className="text-muted-foreground">{t('floor')}:</span> <span className="font-semibold">{selectedResident?.floor}</span></div>
                  {selectedResident?.phone && (
                    <div className="text-xs sm:text-sm"><span className="text-muted-foreground">{t('phone_number')}:</span> <span className="font-semibold">{selectedResident?.phone}</span></div>
                  )}
                </div>
                {(selectedResident?.profession || selectedResident?.emergency_contact) && (
                  <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 pt-3 border-t border-border/50">
                    {selectedResident?.profession && (
                      <div className="text-[10px] sm:text-xs"><span className="text-muted-foreground uppercase font-bold tracking-tight">{t('profession')}:</span> <span className="font-medium ml-1">{selectedResident?.profession}</span></div>
                    )}
                    {selectedResident?.emergency_contact && (
                      <div className="text-[10px] sm:text-xs"><span className="text-muted-foreground uppercase font-bold tracking-tight">{t('emergency_contact')}:</span> <span className="font-medium ml-1">{selectedResident?.emergency_contact}</span></div>
                    )}
                  </div>
                )}
              </DialogHeader>
              {activeTab === 'active' && (
                <Button onClick={() => openExtend(selectedResident)} className="w-full sm:w-auto h-9 text-[10px] sm:text-xs font-semibold px-4">
                  <Plus size={14} className="mr-2" /> {t('extend')}
                </Button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 sm:p-6">
            <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow><TableHead className="px-4 text-[10px] font-semibold">Periode</TableHead><TableHead className="hidden sm:table-cell text-[10px] font-semibold">Keterangan</TableHead><TableHead className="text-[10px] font-semibold">Jumlah</TableHead><TableHead className="text-right text-[10px] font-semibold">Aksi</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {getResidentInvoices(selectedResident?.resident_id).map((inv) => (
                    <TableRow key={inv.id} className="border-border">
                      <TableCell className="px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-foreground">{inv.month_year}</span>
                          <span className="text-[9px] text-muted-foreground italic">{inv.period_start} s/d {inv.period_end}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs">{inv.description}</TableCell>
                      <TableCell className="font-bold text-xs sm:text-sm whitespace-nowrap text-primary">Rp {inv.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-right whitespace-nowrap px-4">
                        {inv.status === 'unpaid' ? (
                          <Button size="sm" onClick={() => openPayment(inv)} className="h-7 text-[9px] font-semibold px-3 bg-rose-500 hover:bg-rose-600 text-white">Bayar</Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => openTransactionDetail(inv.id)} className="h-7 text-[9px] font-semibold px-2 gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            <CheckCircle2 size={10} /> {t('detail')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="p-4 border-t bg-muted/20 flex justify-between gap-4">
            {activeTab === 'history' && (
              <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedResident.id)} className="text-[9px] font-semibold"><Trash2 size={14} className="mr-2" /> Hapus</Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(false)} className="ml-auto text-[9px] font-semibold">Tutup</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Extend */}
      <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t('extend')} Sewa</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4 text-center sm:text-left">
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
              <p className="text-[10px] text-muted-foreground font-semibold mb-1">Mulai Dari</p>
              <p className="text-xl font-black text-foreground">{extendData.start_date}</p>
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-semibold text-muted-foreground">Tambah Durasi (Bulan)</Label>
              <Input type="number" min="1" value={extendData.months} onChange={(e) => setExtendData({...extendData, months: parseInt(e.target.value)})} className="h-12 bg-muted/30 text-center text-lg font-bold" />
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsExtendDialogOpen(false)}>Batal</Button><Button onClick={handleExtend}>Tambah Tagihan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Bayar Tagihan */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Pelunasan Tagihan</DialogTitle></DialogHeader>
          {selectedInvoice && (
            <div className="grid gap-4 py-4">
              <div className="bg-muted/30 p-4 rounded-xl border border-border text-center">
                <p className="text-[10px] text-muted-foreground font-semibold mb-1">{selectedInvoice.description}</p>
                <p className="text-2xl font-black text-primary">Rp {selectedInvoice.amount.toLocaleString()}</p>
              </div>
              <div className="grid gap-2"><Label className="text-[10px] font-semibold text-muted-foreground ml-1">Metode</Label>
                <UISelect value={paymentData.method} onValueChange={(val: any) => setPaymentData({...paymentData, method: val})}><UISelectTrigger className="h-11"><UISelectValue /></UISelectTrigger><UISelectContent><UISelectItem value="Transfer">Transfer Bank</UISelectItem><UISelectItem value="Cash">Tunai / Cash</UISelectItem></UISelectContent></UISelect>
              </div>
              {paymentData.method === 'Transfer' && (
                <div className="grid gap-2">
                  <Label className="text-[10px] font-semibold text-muted-foreground ml-1">Bukti Transfer</Label>
                  <Input type="file" accept="image/*" onChange={handleFileChange} className="h-11 cursor-pointer bg-muted/30 file:bg-primary file:text-primary-foreground file:border-0 file:text-[10px] file:font-semibold file:h-full file:-ml-3 file:mr-3" />
                  {paymentData.proof_image && (
                    <div className="mt-2 relative w-full h-32 border border-border rounded-xl overflow-hidden bg-muted/50">
                      <img src={paymentData.proof_image} className="w-full h-full object-contain" alt="Preview" />
                    </div>
                  )}
                </div>
              )}
              <div className="grid gap-2"><Label className="text-[10px] font-semibold text-muted-foreground ml-1">Tanggal</Label><Input type="date" value={paymentData.date} onChange={(e) => setPaymentData({...paymentData, date: e.target.value})} className="h-11 bg-muted/30" /></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)} className="h-11">Batal</Button><Button onClick={handlePayInvoice} className="h-11">Konfirmasi Lunas</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Detail Pembayaran */}
      <Dialog open={isTransactionDetailOpen} onOpenChange={setIsTransactionDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-emerald-600"><CheckCircle2 size={20} /> Pembayaran Berhasil</DialogTitle></DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6 py-4">
              <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 space-y-4 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold mb-1">Total Dibayar</p>
                  <p className="text-3xl font-black text-emerald-600 tracking-tighter text-shadow-sm">Rp {selectedTransaction.amount.toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-500/10">
                  <div className="text-center">
                    <p className="text-[9px] text-muted-foreground font-semibold mb-0.5">Metode</p>
                    <p className="text-xs font-bold text-foreground">{selectedTransaction.payment_method}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-muted-foreground font-semibold mb-0.5">Tanggal</p>
                    <p className="text-xs font-bold text-foreground">{selectedTransaction.date}</p>
                  </div>
                </div>
              </div>

              {selectedTransaction.proof_image && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-semibold text-muted-foreground ml-1">Bukti Transfer</Label>
                  <div className="border border-border rounded-2xl overflow-hidden bg-muted/30 group relative cursor-pointer" onClick={() => window.open(selectedTransaction.proof_image, '_blank')}>
                    <img src={selectedTransaction.proof_image} alt="Bukti" className="w-full h-auto max-h-60 object-contain transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-[10px] font-semibold flex items-center gap-2"><ImageIcon size={14} /> Lihat Penuh</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter><Button variant="outline" className="w-full h-11 text-[10px] font-semibold" onClick={() => setIsTransactionDetailOpen(false)}>Tutup Kwitansi</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
