"use client";

import { useState } from "react";
import { Briefcase, Plus, User, Calendar, Wallet, CheckCircle2, Clock } from "lucide-react";
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
import { useData } from "@/context/DataContext";

export default function KaryawanPage() {
  const { employees, addEmployee, transactions, addTransaction, t } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    salary: 0,
    join_date: new Date().toISOString().split('T')[0]
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

  const handlePaySalary = async (employee: any) => {
    try {
      const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      await addTransaction({
        type: 'expense',
        category: 'Gaji Karyawan',
        amount: employee.salary,
        date: new Date().toISOString().split('T')[0],
        description: `Gaji ${employee.name} bulan ${currentMonth}`
      });
    } catch (error) {
      console.error(error);
      alert("Gagal memproses gaji.");
    }
  };

  const isSalaryPaid = (employeeName: string) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions.some(tr => {
      const d = new Date(tr.date);
      return tr.category === 'Gaji Karyawan' && 
             tr.description.includes(employeeName) &&
             d.getMonth() === currentMonth &&
             d.getFullYear() === currentYear;
    });
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

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border-border bg-card">
          <CardContent className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">{t('total_staff')}</p>
              <User size={14} className="text-muted-foreground" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">{employees.length}</div>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5">{t('active')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border bg-card">
          <CardContent className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">{t('salary_paid')}</p>
              <CheckCircle2 size={14} className="text-emerald-500" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold tracking-tight text-emerald-600">
                {employees.filter(e => isSalaryPaid(e.name)).length}
              </div>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5">Bulan Ini</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border bg-card col-span-2 lg:col-span-1">
          <CardContent className="p-4 flex flex-col justify-between min-h-[80px]">
            <div className="flex justify-between items-start">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">{t('outstanding')}</p>
              <Clock size={14} className="text-rose-500" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold tracking-tight text-rose-600">
                {employees.filter(e => !isSalaryPaid(e.name)).length}
              </div>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5">Belum Bayar</p>
            </div>
          </CardContent>
        </Card>
      </div>

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
                        <span className="font-bold text-foreground text-sm sm:text-base">{e.name}</span>
                        <span className="text-[9px] text-muted-foreground font-medium tracking-tighter mt-0.5">{t('join_date')} {e.join_date}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 whitespace-nowrap text-[10px] font-semibold text-muted-foreground">{e.position}</TableCell>
                    <TableCell className="py-4 px-4 text-right font-bold text-foreground text-xs sm:text-sm whitespace-nowrap">Rp {e.salary.toLocaleString()}</TableCell>
                    <TableCell className="py-4 px-4 text-center whitespace-nowrap">
                      {isSalaryPaid(e.name) ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mx-auto" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mx-auto animate-pulse" />
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-4 text-right whitespace-nowrap">
                      {!isSalaryPaid(e.name) && (
                        <Button variant="outline" size="sm" className="h-8 text-[9px] font-semibold px-3 bg-secondary/50" onClick={() => handlePaySalary(e)}>
                          Bayar
                        </Button>
                      )}
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
