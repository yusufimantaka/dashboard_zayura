"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Palette, Languages, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, themeColor, setThemeColor, t } = useData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const themes = [
    { id: 'default', name: 'Zayura Noir', color: 'bg-slate-900' },
    { id: 'gold', name: 'Luxury Gold', color: 'bg-[#d4af37]' },
    { id: 'emerald', name: 'Royal Emerald', color: 'bg-[#046307]' },
    { id: 'rose', name: 'Elegant Rose', color: 'bg-[#880808]' },
  ];

  return (
    <div className="space-y-8 pb-10 max-w-2xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">{t('system_settings')}</h2>
        <p className="text-muted-foreground text-sm">{t('settings_subtitle')}</p>
      </div>

      <div className="grid gap-6">
        {/* Appearance Section */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sun className="size-5 text-primary" />
              <div>
                <CardTitle className="text-lg">{t('appearance')}</CardTitle>
                <CardDescription className="text-xs">Pilih antara mode terang atau gelap.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="font-semibold">{t('dark_mode')}</Label>
              <Switch 
                id="dark-mode" 
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Color Palette Section */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="size-5 text-primary" />
              <div>
                <CardTitle className="text-lg">{t('color_palette')}</CardTitle>
                <CardDescription className="text-xs">Ubah warna aksen sistem untuk tampilan lebih elegan.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={themeColor} 
              onValueChange={(val: any) => setThemeColor(val)}
              className="grid grid-cols-2 gap-4"
            >
              {themes.map((themeItem) => (
                <Label
                  key={themeItem.id}
                  htmlFor={themeItem.id}
                  className={cn(
                    "flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all",
                    themeColor === themeItem.id && "border-primary"
                  )}
                >
                  <RadioGroupItem value={themeItem.id} id={themeItem.id} className="sr-only" />
                  <div className={cn("size-6 rounded-full mb-3 shadow-inner", themeItem.color)} />
                  <span className="text-xs font-bold tracking-tight uppercase">{themeItem.name}</span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Language Section */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Languages className="size-5 text-primary" />
              <div>
                <CardTitle className="text-lg">{t('language')}</CardTitle>
                <CardDescription className="text-xs">Atur bahasa yang digunakan di dashboard.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Pilih Bahasa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Bahasa Indonesia</SelectItem>
                <SelectItem value="en">English (US)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Security Info */}
        <div className="p-6 bg-secondary/30 rounded-2xl border border-border flex items-start gap-4">
          <ShieldCheck className="size-6 text-emerald-500 mt-1" />
          <div className="space-y-1">
            <p className="text-sm font-bold">{t('security_data')}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('settings_save_note')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

