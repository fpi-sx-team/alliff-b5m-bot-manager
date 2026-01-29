import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Bot, Save } from "lucide-react";

export default function EditBot() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const botId = params.id ? parseInt(params.id) : 0;
  
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
    welcomeMessage: "",
    helpMessage: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("keyData");
    if (!stored) {
      setLocation("/login");
      return;
    }
    setKeyData(JSON.parse(stored));
  }, [setLocation]);

  const { data: bot, isLoading } = trpc.bots.getById.useQuery(
    { id: botId },
    { enabled: !!keyData && botId > 0 }
  );

  useEffect(() => {
    if (bot) {
      setFormData({
        botName: bot.botName,
        adminUid: bot.adminUid,
        adminName: bot.adminName,
        accountUid: bot.accountUid,
        accountPassword: bot.accountPassword,
        telegramUsername: bot.telegramUsername || "",
        instagramUsername: bot.instagramUsername || "",
        tiktokUsername: bot.tiktokUsername || "",
        welcomeMessage: bot.welcomeMessage || "",
        helpMessage: bot.helpMessage || "",
      });
    }
  }, [bot]);

  const updateMutation = trpc.bots.update.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ التعديلات بنجاح!");
      setLocation("/my-bots");
    },
    onError: (error) => {
      toast.error(error.message || "فشل حفظ التعديلات");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.botName || !formData.adminUid || !formData.adminName || !formData.accountUid || !formData.accountPassword) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    updateMutation.mutate({
      id: botId,
      ...formData,
    });
  };

  if (!keyData || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">البوت غير موجود</h2>
          <Button onClick={() => setLocation("/my-bots")}>العودة للقائمة</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/my-bots")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">تعديل البوت</h1>
                <p className="text-sm text-gray-500">{bot.botName}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="elegant-card">
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
              <CardDescription>
                تعديل معلومات البوت الأساسية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="botName">اسم البوت</Label>
                <Input
                  id="botName"
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
                    value={formData.adminUid}
                    onChange={(e) => setFormData({ ...formData, adminUid: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminName">اسم الأدمن</Label>
                  <Input
                    id="adminName"
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
                    value={formData.accountPassword}
                    onChange={(e) => setFormData({ ...formData, accountPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telegramUsername">اسم التلجرام</Label>
                  <Input
                    id="telegramUsername"
                    placeholder="@username"
                    value={formData.telegramUsername}
                    onChange={(e) => setFormData({ ...formData, telegramUsername: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagramUsername">اسم الإنستغرام</Label>
                  <Input
                    id="instagramUsername"
                    placeholder="@username"
                    value={formData.instagramUsername}
                    onChange={(e) => setFormData({ ...formData, instagramUsername: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktokUsername">اسم التيك توك</Label>
                  <Input
                    id="tiktokUsername"
                    placeholder="@username"
                    value={formData.tiktokUsername}
                    onChange={(e) => setFormData({ ...formData, tiktokUsername: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="elegant-card">
            <CardHeader>
              <CardTitle>رسائل البوت</CardTitle>
              <CardDescription>
                تخصيص رسائل الترحيب والمساعدة (اختياري)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Welcome Message Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">رسالة الترحيب</h3>
                </div>
                
                {bot.welcomeMessage && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-xs font-semibold text-blue-600 mb-2">الرسالة الحالية:</p>
                    <div className="bg-white rounded p-3 text-sm whitespace-pre-wrap break-words border border-blue-100">
                      {bot.welcomeMessage}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="welcomeMessage">تعديل رسالة الترحيب</Label>
                  <Textarea
                    id="welcomeMessage"
                    placeholder="رسالة الترحيب التي سيرسلها البوت..."
                    rows={4}
                    value={formData.welcomeMessage}
                    onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t pt-6"></div>

              {/* Help Message Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">قائمة المساعدة (Help Menu)</h3>
                </div>
                
                {bot.helpMessage && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-xs font-semibold text-green-600 mb-2">القائمة الحالية:</p>
                    <div className="bg-white rounded p-3 text-sm whitespace-pre-wrap break-words max-h-48 overflow-y-auto border border-green-100">
                      {bot.helpMessage}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="helpMessage">تعديل قائمة المساعدة</Label>
                  <Textarea
                    id="helpMessage"
                    placeholder="أدخل قائمة المساعدة التي سيرسلها البوت عند طلب /help..."
                    rows={8}
                    value={formData.helpMessage}
                    onChange={(e) => setFormData({ ...formData, helpMessage: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    💡 يمكنك استخدام الأسطر والرموز لتنسيق القائمة
                  </p>
                </div>

                {formData.helpMessage && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm font-semibold mb-2 text-purple-600">معاينة التعديلات الجديدة:</p>
                    <div className="bg-white rounded p-3 text-sm whitespace-pre-wrap break-words max-h-48 overflow-y-auto border border-purple-100">
                      {formData.helpMessage}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1"
              disabled={updateMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/my-bots")}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
