"use client";

import { useState } from "react";
import { Briefcase, Plus, User, Calendar, Wallet, CheckCircle2, Clock, Receipt, ImageIcon, History, Trash2, Camera } from "lucide-react";
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
  Select as UISelect, 
  SelectContent as UISelectContent, 
  SelectItem as UISelectItem, 
  SelectTrigger as UISelectTrigger, 
  SelectValue as UISelectValue 
} from "@/components/ui/select";
import { useData } from "@/context/DataContext";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCard, cardContainerVariants } from "@/components/AnimatedCard";
import { CountUp } from "@/components/CountUp";
import { cn } from "@/lib/utils";

export default function KaryawanPage() {
  const { employees, addEmployee, transactions, addPayroll, payPayroll, payroll, t, themeColor } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);
  const [isTransactionDetailOpen, setIsTransactionDetailOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    salary: 0,
    join_date: new Date().toISOString().split('T')[0]
  });

  const [paymentData, setPaymentData] = useState({
    method: "Transfer" as "Transfer" | "Cash",
    date: new Date().toISOString().split('T')[0],
    proof_image: ""
  });

  const handleAddEmployee = async () => {
    if (formData.name && formData.position && formData.salary > 0) {
      try {
        await addEmployee({
          name: formData.name,
          position: formData.position,
          salary: formData.salary,
          join_date: formData.join_date
        });

        // Generate first payroll automatically for current month
        // In a real app, this might be more complex
        setIsDialogOpen(false);
        setFormData({
          name: "",
          position: "",
          salary: 0,
          join_date: new Date().toISOString().split('T')[0]
        });
      } catch (error) {
        console.error(error);
        alert("Gagal menambah karyawan.");
      }
    }
  };

  const handleGeneratePayroll = async (employee: any) => {
    const monthYear = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    
    // Check if payroll already exists for this month
    const exists = payroll.find(p => p.employee_id === employee.id && p.month_year === monthYear);
    if (exists) {
      alert("Payroll bulan ini sudah ada.");
      return;
    }

    try {
      await addPayroll({
        employee_id: employee.id,
        month_year: monthYear,
        amount: employee.salary,
        status: 'unpaid',
        due_date: new Date().toISOString().split('T')[0]
      });
      alert(`Payroll ${monthYear} berhasil dibuat untuk ${employee.name}`);
    } catch (error) {
      console.error(error);
      alert("Gagal membuat payroll.");
    }
  };

  const handlePayPayroll = async () => {
    if (selectedPayroll && selectedEmployee) {
      try {
        await payPayroll(selectedPayroll.id, {
          type: 'expense',
          category: 'Gaji Karyawan',
          amount: selectedPayroll.amount,
          date: paymentData.date,
          description: `Pembayaran Gaji: ${selectedEmployee.name} - ${selectedPayroll.month_year}`,
          payment_method: paymentData.method,
          proof_image: paymentData.method === 'Transfer' ? paymentData.proof_image : undefined
        });
        setIsPaymentDialogOpen(false);
        setSelectedPayroll(null);
        setPaymentData({ method: "Transfer", date: new Date().toISOString().split('T')[0], proof_image: "" });
      } catch (error) {
        console.error(error);
        alert("Gagal memproses pembayaran gaji.");
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

  const openDetail = (employee: any) => {
    setSelectedEmployee(employee);
    setIsDetailOpen(true);
  };

  const openPayment = (payrollItem: any) => {
    setSelectedPayroll(payrollItem);
    setIsPaymentDialogOpen(true);
  };

  const openTransactionDetail = (payrollId: string) => {
    const transaction = transactions.find(tr => tr.payroll_id === payrollId);
    if (transaction) {
      setSelectedTransaction(transaction);
      setIsTransactionDetailOpen(true);
    }
  };

  const getEmployeePayroll = (employeeId: string) => payroll.filter(p => p.employee_id === employeeId).sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());

  const hasUnpaidPayroll = (employeeId: string) => payroll.some(p => p.employee_id === employeeId && p.status === 'unpaid');
  const isPaidThisMonth = (employeeId: string) => {
    const currentMonthYear = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    return payroll.some(p => p.employee_id === employeeId && p.month_year === currentMonthYear && p.status === 'paid');
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('staff_title')}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">{t('staff_subtitle')}</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-10 px-4 text-[10px] sm:text-xs font-semibold shadow-sm w-full md:w-auto">
              <Plus size={18} className="mr-2" />
              {t('add_employee')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('add_employee')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nama Lengkap</Label>
                <Input 
                  placeholder="Contoh: Siti Aminah"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('position')} / Jabatan</Label>
                <Input 
                  placeholder="Contoh: Kebersihan, Keamanan"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('salary')} per Bulan (Rp)</Label>
                <Input 
                  type="number" 
                  placeholder="2000000"
                  value={formData.salary || ""}
                  onChange={(e) => setFormData({...formData, salary: parseInt(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('join_date')}</Label>
                <Input 
                  type="date"
                  value={formData.join_date}
                  onChange={(e) => setFormData({...formData, join_date: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button onClick={handleAddEmployee}>Simpan Karyawan</Button>
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
          <div className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">{t('total_staff')}</p>
              <User size={14} className="text-muted-foreground" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                <CountUp value={employees.length} />
              </div>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5">{t('active')}</p>
            </div>
          </div>
        </AnimatedCard>
        
        <AnimatedCard>
          <div className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">{t('salary_paid')}</p>
              <CheckCircle2 size={14} className="text-emerald-500" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-emerald-600">
                <CountUp value={employees.filter(e => isPaidThisMonth(e.id)).length} />
              </div>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5">Bulan Ini</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="col-span-2 lg:col-span-1">
          <div className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">{t('outstanding')}</p>
              <Clock size={14} className="text-rose-500" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-rose-600">
                <CountUp value={employees.filter(e => hasUnpaidPayroll(e.id)).length} />
              </div>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5">Total Belum Bayar</p>
            </div>
          </div>
        </AnimatedCard>
      </motion.div>

      <Card className="shadow-sm border-border overflow-hidden rounded-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-hide">
            <Table>
              <TableHeader className="bg-muted/50 border-b">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-4 px-4 font-semibold text-foreground whitespace-nowrap text-[10px]">{t('employees')}</TableHead>
                  <TableHead className="py-4 px-4 font-semibold text-foreground whitespace-nowrap text-[10px]">{t('position')}</TableHead>
                  <TableHead className="py-4 px-4 font-semibold text-foreground whitespace-nowrap text-right text-[10px]">{t('salary')}</TableHead>
                  <TableHead className="py-4 px-4 font-semibold text-foreground whitespace-nowrap text-center text-[10px]">{t('status')}</TableHead>
                  <TableHead className="py-4 px-4 text-right font-semibold text-foreground whitespace-nowrap text-[10px]">{t('action')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((e) => (
                  <TableRow key={e.id} className="group hover:bg-muted/50 transition-colors border-border">
                    <TableCell className="py-4 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={cn(
                          "font-bold text-sm sm:text-base transition-all duration-300",
                          themeColor === 'gold' ? "text-gold-gradient" : "text-foreground"
                        )}>
                          {e.name}
                        </span>
                        <span className="text-[9px] text-muted-foreground font-medium tracking-tighter mt-0.5">{t('join_date')} {e.join_date}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 whitespace-nowrap text-[10px] font-semibold text-muted-foreground">{e.position}</TableCell>
                    <TableCell className="py-4 px-4 text-right font-bold text-foreground text-xs sm:text-sm whitespace-nowrap">Rp {e.salary.toLocaleString()}</TableCell>
                    <TableCell className="py-4 px-4 text-center whitespace-nowrap">
                      {hasUnpaidPayroll(e.id) ? (
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                          <span className="text-[9px] font-bold text-muted-foreground uppercase">{t('unpaid')}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[9px] font-bold text-muted-foreground uppercase">{t('paid')}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openDetail(e)} className="h-8 text-[10px] font-semibold px-3 bg-secondary/50 rounded-lg">{t('detail')}</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleGeneratePayroll(e)} title="Generate Payroll Bulan Ini" className="text-muted-foreground hover:text-primary transition-colors h-7 w-7 p-0 rounded-full"><Plus size={14} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Payroll Karyawan */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <div className="p-6 border-b bg-muted/20">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2"><Receipt className="text-primary" /> Payroll: {selectedEmployee?.name}</DialogTitle>
                <div className="flex gap-4 mt-2">
                  <div className="text-xs sm:text-sm"><span className="text-muted-foreground">{t('position')}:</span> <span className="font-semibold">{selectedEmployee?.position}</span></div>
                  <div className="text-xs sm:text-sm"><span className="text-muted-foreground">{t('salary')}:</span> <span className="font-semibold">Rp {selectedEmployee?.salary.toLocaleString()}</span></div>
                </div>
              </DialogHeader>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 sm:p-6">
            <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow><TableHead className="px-4 text-[10px] font-semibold">Bulan</TableHead><TableHead className="text-[10px] font-semibold">Jumlah</TableHead><TableHead className="text-right text-[10px] font-semibold">Aksi</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {getEmployeePayroll(selectedEmployee?.id).map((p) => (
                    <TableRow key={p.id} className="border-border">
                      <TableCell className="px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-foreground">{p.month_year}</span>
                          <span className="text-[9px] text-muted-foreground italic">Dibuat: {p.due_date}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-xs sm:text-sm whitespace-nowrap text-primary">Rp {p.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-right whitespace-nowrap px-4">
                        {p.status === 'unpaid' ? (
                          <Button size="sm" onClick={() => openPayment(p)} className="h-7 text-[9px] font-semibold px-3 bg-rose-500 hover:bg-rose-600 text-white">Bayar Gaji</Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => openTransactionDetail(p.id)} className="h-7 text-[9px] font-semibold px-2 gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            <CheckCircle2 size={10} /> {t('detail')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {getEmployeePayroll(selectedEmployee?.id).length === 0 && (
                    <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground italic text-xs">Belum ada data payroll.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="p-4 border-t bg-muted/20 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(false)} className="text-[9px] font-semibold">Tutup</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Bayar Payroll */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Pembayaran Gaji Karyawan</DialogTitle></DialogHeader>
          {selectedPayroll && (
            <div className="grid gap-4 py-4">
              <div className="bg-muted/30 p-4 rounded-xl border border-border text-center">
                <p className="text-[10px] text-muted-foreground font-semibold mb-1">Gaji {selectedEmployee?.name} - {selectedPayroll.month_year}</p>
                <p className="text-2xl font-black text-primary">Rp {selectedPayroll.amount.toLocaleString()}</p>
              </div>
              <div className="grid gap-2"><Label className="text-[10px] font-semibold text-muted-foreground ml-1">Metode</Label>
                <UISelect value={paymentData.method} onValueChange={(val: any) => setPaymentData({...paymentData, method: val})}>
                  <UISelectTrigger className="h-11">
                    <UISelectValue />
                  </UISelectTrigger>
                  <UISelectContent>
                    <UISelectItem value="Transfer">Transfer Bank</UISelectItem>
                    <UISelectItem value="Cash">Tunai / Cash</UISelectItem>
                  </UISelectContent>
                </UISelect>
              </div>
              {paymentData.method === 'Transfer' && (
                <div className="grid gap-2">
                  <Label className="text-[10px] font-semibold text-muted-foreground ml-1">Bukti Pembayaran / Transfer</Label>
                  <Input type="file" accept="image/*" onChange={handleFileChange} className="h-11 cursor-pointer bg-muted/30 file:bg-primary file:text-primary-foreground file:border-0 file:text-[10px] file:font-semibold file:h-full file:-ml-3 file:mr-3" />
                  {paymentData.proof_image && (
                    <div className="mt-2 relative w-full h-32 border border-border rounded-xl overflow-hidden bg-muted/50">
                      <img src={paymentData.proof_image} className="w-full h-full object-contain" alt="Preview" />
                    </div>
                  )}
                </div>
              )}
              <div className="grid gap-2"><Label className="text-[10px] font-semibold text-muted-foreground ml-1">Tanggal Bayar</Label><Input type="date" value={paymentData.date} onChange={(e) => setPaymentData({...paymentData, date: e.target.value})} className="h-11 bg-muted/30" /></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)} className="h-11">Batal</Button><Button onClick={handlePayPayroll} className="h-11">Konfirmasi Bayar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Detail Pembayaran Payroll */}
      <Dialog open={isTransactionDetailOpen} onOpenChange={setIsTransactionDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-emerald-600"><CheckCircle2 size={20} /> Pembayaran Berhasil</DialogTitle></DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6 py-4">
              <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 space-y-4 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold mb-1">Gaji Dibayar</p>
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
                  <Label className="text-[10px] font-semibold text-muted-foreground ml-1">Bukti Pembayaran</Label>
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
