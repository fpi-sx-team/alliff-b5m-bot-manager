import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Bot, Plus, Settings, LogOut, Activity, Users, MessageCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [keyData, setKeyData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("keyData");
    if (!stored) {
      setLocation("/login");
      return;
    }
    setKeyData(JSON.parse(stored));
  }, [setLocation]);

  const { data: stats, isLoading: statsLoading } = trpc.statistics.get.useQuery(undefined, {
    enabled: !!keyData,
  });

  const { data: bots, isLoading: botsLoading } = trpc.bots.list.useQuery(undefined, {
    enabled: !!keyData,
  });

  const handleLogout = () => {
    localStorage.removeItem("keyData");
    toast.success("تم تسجيل الخروج بنجاح");
    setLocation("/login");
  };

  if (!keyData) {
    return null;
  }

  const activeBots = bots?.filter(bot => bot.status === "running").length || 0;
  const totalBots = bots?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Free Fire Bot Manager</h1>
                <p className="text-sm text-gray-500">لوحة التحكم</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Developer Info Section */}
        <a href="https://t.me/AlliFF_BOT" target="_blank" rel="noopener noreferrer" className="block mb-8 hover:no-underline">
          <Card className="elegant-card bg-gradient-to-r from-primary to-blue-600 text-white border-0 cursor-pointer hover:shadow-2xl transition-all hover:scale-105">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MessageCircle className="w-6 h-6" />
                تواصل مع المطور
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold">المطور:</span>
                <span>AlliFF</span>
              </div>
              <div className="flex items-center gap-2 text-lg">
                <span className="font-semibold">Telegram:</span>
                <span className="font-bold">@AlliFF_BOT</span>
              </div>
              <div className="text-sm opacity-90 mt-4 pt-4 border-t border-white/20">
                اضغط هنا للتواصل مع المطور عبر التلجرام 📱
              </div>
            </CardContent>
          </Card>
        </a>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="elegant-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي البوتات في المنصة
              </CardTitle>
              <Bot className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {statsLoading ? "..." : stats?.totalBotsCreated || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                عدد البوتات الكلي في النظام
              </p>
            </CardContent>
          </Card>

          <Card className="elegant-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                بوتاتك
              </CardTitle>
              <Settings className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {botsLoading ? "..." : `${totalBots} / ${keyData?.maxBots || 0}`}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                عدد البوتات المستخدمة من الحد الأقصى
              </p>
            </CardContent>
          </Card>

          <Card className="elegant-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                البوتات النشطة
              </CardTitle>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {botsLoading ? "..." : activeBots}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                عدد البوتات قيد التشغيل حالياً
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/create-bot">
            <Card className="elegant-card cursor-pointer hover:shadow-xl transition-all border-2 border-primary/20 hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Plus className="w-6 h-6" />
                  إنشاء بوت جديد
                </CardTitle>
                <CardDescription>
                  قم بإنشاء بوت جديد وابدأ في استخدامه فوراً
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/my-bots">
            <Card className="elegant-card cursor-pointer hover:shadow-xl transition-all border-2 border-blue-500/20 hover:border-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Bot className="w-6 h-6" />
                  إدارة البوتات
                </CardTitle>
                <CardDescription>
                  عرض وإدارة جميع البوتات الخاصة بك
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Key Info */}
        <Card className="elegant-card mt-8 bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">معلومات المفتاح</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">رمز المفتاح:</span>
              <span className="font-mono font-semibold">{keyData?.keyCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">الحد الأقصى للبوتات:</span>
              <span className="font-semibold">{keyData?.maxBots}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">تاريخ الانتهاء:</span>
              <span className="font-semibold">
                {new Date(keyData?.expiryDate).toLocaleDateString("ar-EG")}
              </span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
