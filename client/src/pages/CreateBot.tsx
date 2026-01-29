import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { ArrowLeft, Bot } from "lucide-react";

export default function CreateBot() {
  const [, setLocation] = useLocation();
  const [keyData, setKeyData] = useState<any>(null);
  const [formData, setFormData] = useState({
    botName: "",
    adminUid: "",
    adminName: "",
    accountUid: "",
    accountPassword: "",
    telegramUsername: "",
    instagramUsername: "",
    tiktokUsername: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("keyData");
    if (!stored) {
      setLocation("/login");
      return;
    }
    setKeyData(JSON.parse(stored));
  }, [setLocation]);

  const createBotMutation = trpc.bots.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء البوت بنجاح!");
      setLocation("/my-bots");
    },
    onError: (error) => {
      toast.error(error.message || "فشل إنشاء البوت");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.botName || !formData.adminUid || !formData.adminName || !formData.accountUid || !formData.accountPassword) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    createBotMutation.mutate(formData);
  };

  if (!keyData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">إنشاء بوت جديد</h1>
                <p className="text-sm text-gray-500">قم بملء المعلومات المطلوبة</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="elegant-card">
          <CardHeader>
            <CardTitle>معلومات البوت</CardTitle>
            <CardDescription>
              أدخل جميع المعلومات المطلوبة لإنشاء البوت الخاص بك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="botName">اسم البوت</Label>
                <Input
                  id="botName"
                  placeholder="أدخل اسم البوت"
                  value={formData.botName}
                  onChange={(e) => setFormData({ ...formData, botName: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminUid">ADMIN UID</Label>
                  <Input
                    id="adminUid"
                    placeholder="معرف الأدمن"
                    value={formData.adminUid}
                    onChange={(e) => setFormData({ ...formData, adminUid: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminName">اسم الأدمن</Label>
                  <Input
                    id="adminName"
                    placeholder="أدخل اسم الأدمن"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountUid">Account UID</Label>
                  <Input
                    id="accountUid"
                    placeholder="معرف الحساب"
                    value={formData.accountUid}
                    onChange={(e) => setFormData({ ...formData, accountUid: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountPassword">Account Password</Label>
                  <Input
                    id="accountPassword"
                    type="password"
                    placeholder="كلمة مرور الحساب"
                    value={formData.accountPassword}
                    onChange={(e) => setFormData({ ...formData, accountPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telegramUsername">اسم التلجرام (اختياري)</Label>
                  <Input
                    id="telegramUsername"
                    placeholder="مثال: @username"
                    value={formData.telegramUsername}
                    onChange={(e) => setFormData({ ...formData, telegramUsername: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagramUsername">اسم الإنستغرام (اختياري)</Label>
                  <Input
                    id="instagramUsername"
                    placeholder="مثال: @username"
                    value={formData.instagramUsername}
                    onChange={(e) => setFormData({ ...formData, instagramUsername: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktokUsername">اسم التيك توك (اختياري)</Label>
                  <Input
                    id="tiktokUsername"
                    placeholder="مثال: @username"
                    value={formData.tiktokUsername}
                    onChange={(e) => setFormData({ ...formData, tiktokUsername: e.target.value })}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>ملاحظة:</strong> سيتم تعيين معلومات المطور الافتراضية:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• المطور: AlliFF</li>
                  <li>• Telegram: @AlliFF_BOT</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createBotMutation.isPending}
                >
                  {createBotMutation.isPending ? "جاري الإنشاء..." : "إنشاء البوت"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/dashboard")}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
