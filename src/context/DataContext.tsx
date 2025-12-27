"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { translations, Language, TranslationKey } from '@/lib/translations';

// Types
export interface Room {
  id: string;
  room_number: string;
  floor: number;
  type: 'Small' | 'Medium' | 'Large';
  status: 'available' | 'occupied' | 'maintenance';
  price_per_month: number;
}

export interface Resident {
  id: string;
  full_name: string;
  phone_number: string;
  ktp_number?: string;
}

export interface Tenancy {
  id: string;
  room_id: string;
  resident_id: string;
  start_date: string;
  expected_end_date: string;
  status: 'active' | 'completed';
}

export interface Invoice {
  id: string;
  tenancy_id: string;
  resident_id: string;
  month_year: string; // e.g., "Januari 2025"
  amount: number;
  status: 'unpaid' | 'paid';
  due_date: string;
  description: string;
  period_start?: string;
  period_end?: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
  payment_method?: 'Transfer' | 'Cash';
  proof_image?: string;
  invoice_id?: string;
}

export interface Laundry {
  id: string;
  resident_id: string;
  weight_kg: number;
  price: number;
  status: 'process' | 'done' | 'picked_up';
  date: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  salary: number;
  join_date: string;
}

interface DataContextType {
  rooms: Room[];
  residents: Resident[];
  tenancies: Tenancy[];
  invoices: Invoice[];
  transactions: Transaction[];
  laundry: Laundry[];
  employees: Employee[];
  user: any | null;
  loading: boolean;
  language: Language;
  themeColor: 'default' | 'gold' | 'emerald' | 'rose';
  t: (key: TranslationKey) => string;
  setLanguage: (lang: Language) => void;
  setThemeColor: (theme: 'default' | 'gold' | 'emerald' | 'rose') => void;
  addRoom: (room: Omit<Room, 'id'>) => Promise<void>;
  addResident: (resident: Omit<Resident, 'id'>) => Promise<string>;
  addTenancy: (tenancy: Omit<Tenancy, 'id'>) => Promise<string>;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  addLaundry: (laundry: Omit<Laundry, 'id'>) => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  updateRoomStatus: (id: string, status: Room['status']) => Promise<void>;
  updateLaundryStatus: (id: string, status: Laundry['status']) => Promise<void>;
  payInvoice: (invoiceId: string, transaction: Omit<Transaction, 'id' | 'invoice_id'>) => Promise<void>;
  checkoutResident: (tenancyId: string) => Promise<void>;
  deleteTenancy: (tenancyId: string) => Promise<void>;
  extendTenancy: (tenancyId: string, newEndDate: string) => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [tenancies, setTenancies] = useState<Tenancy[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [laundry, setLaundry] = useState<Laundry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>('id');
  const [themeColor, setThemeColorState] = useState<'default' | 'gold' | 'emerald' | 'rose'>('default');

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('zayura_lang') as Language;
    const savedTheme = localStorage.getItem('zayura_theme_color') as any;
    if (savedLang) setLanguageState(savedLang);
    if (savedTheme) {
      setThemeColorState(savedTheme);
      // Apply theme class to html
      const root = window.document.documentElement;
      root.classList.remove('theme-gold', 'theme-emerald', 'theme-rose');
      if (savedTheme !== 'default') {
        root.classList.add(`theme-${savedTheme}`);
      }
    }
  }, []);

  const setLanguage = (lang: 'id' | 'en') => {
    setLanguageState(lang);
    localStorage.setItem('zayura_lang', lang);
  };

  const setThemeColor = (theme: 'default' | 'gold' | 'emerald' | 'rose') => {
    setThemeColorState(theme);
    localStorage.setItem('zayura_theme_color', theme);
    // Apply theme class to html
    const root = window.document.documentElement;
    root.classList.remove('theme-gold', 'theme-emerald', 'theme-rose');
    if (theme !== 'default') {
      root.classList.add(`theme-${theme}`);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Check session
      const savedUser = localStorage.getItem('zayura_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      const [
        { data: roomsData },
        { data: residentsData },
        { data: tenanciesData },
        { data: invoicesData },
        { data: transactionsData },
        { data: laundryData },
        { data: employeesData }
      ] = await Promise.all([
        supabase.from('rooms').select('*').order('room_number'),
        supabase.from('residents').select('*').order('full_name'),
        supabase.from('tenancies').select('*'),
        supabase.from('invoices').select('*').order('due_date'),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('laundry').select('*').order('date', { ascending: false }),
        supabase.from('employees').select('*').order('name')
      ]);

      if (roomsData && tenanciesData) {
        // Logika Auto-Sync: Pastikan status kamar sesuai dengan data penghuni aktif
        const activeTenancies = tenanciesData.filter(t => t.status === 'active');
        const syncedRooms = roomsData.map(room => {
          const isOccupied = activeTenancies.some(t => t.room_id === room.id);
          return {
            ...room,
            status: isOccupied ? 'occupied' : (room.status === 'occupied' ? 'available' : room.status)
          } as Room;
        });
        setRooms(syncedRooms);
        setResidents(residentsData || []);
        setTenancies(tenanciesData);
        setInvoices(invoicesData || []);
        if (transactionsData) {
          setTransactions(transactionsData.map(t => ({
            ...t,
            date: t.transaction_date 
          })));
        }
        setLaundry(laundryData || []);
        setEmployees(employeesData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addRoom = async (room: Omit<Room, 'id'>) => {
    const { data, error } = await supabase.from('rooms').insert([room]).select().single();
    if (error) throw error;
    setRooms(prev => [...prev, data]);
  };

  const addResident = async (resident: Omit<Resident, 'id'>) => {
    const { data, error } = await supabase.from('residents').insert([resident]).select().single();
    if (error) throw error;
    setResidents(prev => [...prev, data]);
    return data.id;
  };

  const addTenancy = async (tenancy: Omit<Tenancy, 'id'>) => {
    const { data, error } = await supabase.from('tenancies').insert([tenancy]).select().single();
    if (error) throw error;
    setTenancies(prev => [...prev, data]);
    return data.id;
  };

  const addInvoice = async (invoice: Omit<Invoice, 'id'>) => {
    const { data, error } = await supabase.from('invoices').insert([invoice]).select().single();
    if (error) throw error;
    setInvoices(prev => [...prev, data]);
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const dbTransaction = {
      ...transaction,
      transaction_date: transaction.date
    };
    // @ts-ignore
    delete dbTransaction.date;

    const { data, error } = await supabase.from('transactions').insert([dbTransaction]).select().single();
    if (error) throw error;
    setTransactions(prev => [{ ...data, date: data.transaction_date }, ...prev]);
  };

  const payInvoice = async (invoiceId: string, transaction: Omit<Transaction, 'id' | 'invoice_id'>) => {
    const dbTransaction = {
      ...transaction,
      invoice_id: invoiceId,
      transaction_date: transaction.date
    };
    // @ts-ignore
    delete dbTransaction.date;

    const { data: transData, error: transError } = await supabase.from('transactions').insert([dbTransaction]).select().single();
    if (transError) throw transError;

    const { error: invError } = await supabase.from('invoices').update({ status: 'paid' }).eq('id', invoiceId);
    if (invError) throw invError;

    setTransactions(prev => [{ ...transData, date: transData.transaction_date }, ...prev]);
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'paid' } : inv));
  };

  const updateRoomStatus = async (id: string, status: Room['status']) => {
    const { error } = await supabase.from('rooms').update({ status }).eq('id', id);
    if (error) throw error;
    setRooms(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const checkoutResident = async (tenancyId: string) => {
    const tenancy = tenancies.find(t => t.id === tenancyId);
    if (!tenancy) return;

    const { error: tenError } = await supabase.from('tenancies').update({ status: 'completed' }).eq('id', tenancyId);
    if (tenError) throw tenError;

    await updateRoomStatus(tenancy.room_id, 'available');

    setTenancies(prev => prev.map(t => t.id === tenancyId ? { ...t, status: 'completed' } : t));
  };

  const deleteTenancy = async (tenancyId: string) => {
    const { error } = await supabase.from('tenancies').delete().eq('id', tenancyId);
    if (error) throw error;
    setTenancies(prev => prev.filter(t => t.id !== tenancyId));
  };

  const extendTenancy = async (tenancyId: string, newEndDate: string) => {
    const { error } = await supabase.from('tenancies').update({ expected_end_date: newEndDate }).eq('id', tenancyId);
    if (error) throw error;
    setTenancies(prev => prev.map(t => t.id === tenancyId ? { ...t, expected_end_date: newEndDate } : t));
  };

  const addLaundry = async (item: Omit<Laundry, 'id'>) => {
    const { data, error } = await supabase.from('laundry').insert([item]).select().single();
    if (error) throw error;
    setLaundry(prev => [data, ...prev]);
  };

  const updateLaundryStatus = async (id: string, status: Laundry['status']) => {
    const { error } = await supabase.from('laundry').update({ status }).eq('id', id);
    if (error) throw error;
    setLaundry(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    const { data, error } = await supabase.from('employees').insert([employee]).select().single();
    if (error) throw error;
    setEmployees(prev => [...prev, data]);
  };

  const login = async (username: string, password: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !data) {
      return false;
    }

    setUser(data);
    localStorage.setItem('zayura_user', JSON.stringify(data));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zayura_user');
  };

  return (
    <DataContext.Provider value={{ 
      rooms, residents, tenancies, invoices, transactions, laundry, employees, user, loading,
      language, themeColor, t, setLanguage, setThemeColor,
      addRoom, addResident, addTenancy, addInvoice, addTransaction, addLaundry, addEmployee,
      updateRoomStatus, updateLaundryStatus, payInvoice, checkoutResident, deleteTenancy, extendTenancy,
      login, logout, refreshData: fetchData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
}
