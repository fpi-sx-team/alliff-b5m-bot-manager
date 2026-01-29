import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Bot, Key, Users, Activity, LogOut, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [keyData, setKeyData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("keyData");
    if (!stored) {
      setLocation("/login");
      return;
    }
    const parsed = JSON.parse(stored);
    if (!parsed.isAdmin) {
      toast.error("غير مصرح لك بالوصول إلى لوحة الأدمن");
      setLocation("/dashboard");
      return;
    }
    setKeyData(parsed);
  }, [setLocation]);

  const { data: stats } = trpc.statistics.get.useQuery(undefined, {
    enabled: !!keyData,
  });

  const { data: keys } = trpc.keys.list.useQuery(undefined, {
    enabled: !!keyData,
  });

  const { data: bots } = trpc.bots.list.useQuery(undefined, {
    enabled: !!keyData,
  });

  const handleLogout = () => {
    localStorage.removeItem("keyData");
    toast.success("تم تسجيل الخروج بنجاح");
    setLocation("/login");
  };

  if (!keyData) return null;

  const activeKeys = keys?.filter(k => k.isActive && !k.isAdmin).length || 0;
  const activeBots = bots?.filter(b => b.status === "running").length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">لوحة تحكم الأدمن</h1>
                <p className="text-sm text-gray-500">إدارة شاملة للمنصة</p>
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
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="elegant-card bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي البوتات
              </CardTitle>
              <Bot className="w-4 h-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.totalBotsCreated || 0}
              </div>
              <p className="text-xs opacity-90 mt-1">
                عدد البوتات الكلي
              </p>
            </CardContent>
          </Card>

          <Card className="elegant-card bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                البوتات النشطة
              </CardTitle>
              <Activity className="w-4 h-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {activeBots}
              </div>
              <p className="text-xs opacity-90 mt-1">
                قيد التشغيل حالياً
              </p>
            </CardContent>
          </Card>

          <Card className="elegant-card bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                المفاتيح النشطة
              </CardTitle>
              <Key className="w-4 h-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {activeKeys}
              </div>
              <p className="text-xs opacity-90 mt-1">
                مفاتيح صالحة
              </p>
            </CardContent>
          </Card>

          <Card className="elegant-card bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                المستخدمين
              </CardTitle>
              <Users className="w-4 h-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(stats && 'totalUsers' in stats) ? stats.totalUsers : 0}
              </div>
              <p className="text-xs opacity-90 mt-1">
                عدد المستخدمين
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="elegant-card cursor-pointer hover:shadow-xl transition-all border-2 border-purple-500/20 hover:border-purple-500"
            onClick={() => setLocation("/admin/create-key")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Plus className="w-6 h-6" />
                إنشاء مفتاح جديد
              </CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="elegant-card cursor-pointer hover:shadow-xl transition-all border-2 border-blue-500/20 hover:border-blue-500"
            onClick={() => setLocation("/admin/keys")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Key className="w-6 h-6" />
                إدارة المفاتيح
              </CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="elegant-card cursor-pointer hover:shadow-xl transition-all border-2 border-green-500/20 hover:border-green-500"
            onClick={() => setLocation("/admin/all-bots")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Bot className="w-6 h-6" />
                جميع البوتات
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Keys */}
        <Card className="elegant-card">
          <CardHeader>
            <CardTitle>المفاتيح الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            {keys && keys.length > 0 ? (
              <div className="space-y-2">
                {keys.slice(0, 5).map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-mono font-semibold">{key.keyCode}</p>
                      <p className="text-sm text-muted-foreground">
                        الحد الأقصى: {key.maxBots} بوتات
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {key.isActive ? (
                          <span className="text-green-600 font-semibold">نشط</span>
                        ) : (
                          <span className="text-red-600 font-semibold">معطل</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(key.expiryDate).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                لا توجد مفاتيح بعد
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
