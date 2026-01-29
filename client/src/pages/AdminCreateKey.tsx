import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { ArrowLeft, Key, Plus } from "lucide-react";

export default function AdminCreateKey() {
  const [, setLocation] = useLocation();
  const [keyData, setKeyData] = useState<any>(null);
  const [formData, setFormData] = useState({
    keyCode: "",
    password: "",
    maxBots: 1,
    expiryDays: 30,
    isAdmin: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem("keyData");
    if (!stored) {
      setLocation("/login");
      return;
    }
    const parsed = JSON.parse(stored);
    if (!parsed.isAdmin) {
      toast.error("غير مصرح لك بالوصول");
      setLocation("/dashboard");
      return;
    }
    setKeyData(parsed);
  }, [setLocation]);

  const createKeyMutation = trpc.keys.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء المفتاح بنجاح!");
      setLocation("/admin");
    },
    onError: (error) => {
      toast.error(error.message || "فشل إنشاء المفتاح");
    },
  });

  const generateRandomKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let key = "";
    for (let i = 0; i < 16; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, keyCode: key });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.keyCode || !formData.password) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    if (formData.maxBots < 1) {
      toast.error("يجب أن يكون الحد الأقصى للبوتات 1 على الأقل");
      return;
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + formData.expiryDays);

    createKeyMutation.mutate({
      keyCode: formData.keyCode,
      password: formData.password,
      maxBots: formData.maxBots,
      expiryDate,
      isAdmin: formData.isAdmin,
    });
  };

  if (!keyData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/admin")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">إنشاء مفتاح جديد</h1>
                <p className="text-sm text-gray-500">إنشاء مفتاح وصول جديد</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="elegant-card">
          <CardHeader>
            <CardTitle>معلومات المفتاح</CardTitle>
            <CardDescription>
              قم بإنشاء مفتاح وصول جديد للمستخدمين
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="keyCode">رمز المفتاح *</Label>
                <div className="flex gap-2">
                  <Input
                    id="keyCode"
                    placeholder="أدخل رمز المفتاح"
                    value={formData.keyCode}
                    onChange={(e) => setFormData({ ...formData, keyCode: e.target.value })}
                    required
                  />
                  <Button type="button" variant="outline" onClick={generateRandomKey}>
                    <Plus className="w-4 h-4 mr-2" />
                    توليد
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  يمكنك إدخال رمز مخصص أو توليد رمز عشوائي
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="أدخل كلمة المرور"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxBots">الحد الأقصى للبوتات *</Label>
                  <Input
                    id="maxBots"
                    type="number"
                    min="1"
                    value={formData.maxBots}
                    onChange={(e) => setFormData({ ...formData, maxBots: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDays">مدة الصلاحية (بالأيام) *</Label>
                  <Input
                    id="expiryDays"
                    type="number"
                    min="1"
                    value={formData.expiryDays}
                    onChange={(e) => setFormData({ ...formData, expiryDays: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="isAdmin" className="text-base font-semibold">
                    مفتاح أدمن
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    منح صلاحيات الأدمن لهذا المفتاح
                  </p>
                </div>
                <Switch
                  id="isAdmin"
                  checked={formData.isAdmin}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: checked })}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>معاينة:</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• تاريخ الانتهاء: {new Date(Date.now() + formData.expiryDays * 24 * 60 * 60 * 1000).toLocaleDateString("ar-EG")}</li>
                  <li>• عدد البوتات المسموح: {formData.maxBots}</li>
                  <li>• نوع المفتاح: {formData.isAdmin ? "أدمن" : "مستخدم عادي"}</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createKeyMutation.isPending}
                >
                  {createKeyMutation.isPending ? "جاري الإنشاء..." : "إنشاء المفتاح"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/admin")}
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
