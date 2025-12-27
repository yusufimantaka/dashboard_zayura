"use client";

import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export function LoginPage() {
  const { login, themeColor } = useData();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const success = await login(username, password);
      if (!success) {
        setError("Username atau Password salah.");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-6 transition-colors duration-500 overflow-hidden">
      <div className="w-full max-w-[400px] space-y-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-4"
        >
          <img 
            src="/logo.png" 
            alt="Zayura Logo" 
            className="h-24 mx-auto mb-4 object-contain"
          />
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-8 bg-muted-foreground/30" />
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">Management System</p>
            <div className="h-[1px] w-8 bg-muted-foreground/30" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-border shadow-2xl bg-card/50 backdrop-blur-xl rounded-2xl overflow-hidden relative">
            {themeColor === 'gold' && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gold-gradient" />
            )}
            <CardHeader className="space-y-1 pb-4 text-center">
              <CardTitle className="text-xl font-bold tracking-tight">Login Admin</CardTitle>
              <CardDescription className="text-xs font-medium">Masukkan akses kredensial untuk melanjutkan.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5 px-8 pt-2">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-destructive/10 text-destructive p-3 rounded-lg flex items-center gap-3 text-xs font-bold border border-destructive/20"
                  >
                    <AlertCircle size={14} />
                    {error}
                  </motion.div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Username</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={16} />
                    <Input 
                      id="username"
                      className="pl-10 h-11 bg-background/50 border-border focus:ring-1 focus:ring-foreground/20 transition-all rounded-xl"
                      placeholder="Contoh: admin" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={16} />
                    <Input 
                      id="password"
                      type="password"
                      className="pl-10 h-11 bg-background/50 border-border focus:ring-1 focus:ring-foreground/20 transition-all rounded-xl"
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 pb-8 px-8">
                <Button 
                  type="submit" 
                  className={`w-full h-11 text-sm font-medium shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${themeColor === 'gold' ? 'bg-gold-gradient hover:opacity-90 border-none text-slate-950 font-bold' : ''}`}
                  disabled={loading}
                >
                  {loading ? "Verifikasi..." : "Masuk sekarang"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-center space-y-4"
        >
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
            &copy; 2025 Zayura Exclusive &bull; Jakarta, Indonesia
          </p>
        </motion.div>
      </div>

      {/* Decorative background elements */}
      {themeColor === 'gold' && (
        <>
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold-gradient blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
              opacity: [0.05, 0.1, 0.05]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-48 -left-24 w-[500px] h-[500px] rounded-full bg-gold-gradient blur-3xl"
          />
        </>
      )}
    </div>
  );
}

