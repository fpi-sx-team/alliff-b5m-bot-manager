import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Bot, Play, Square, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminAllBots() {
  const [, setLocation] = useLocation();
  const [keyData, setKeyData] = useState<any>(null);
  const [deleteBotId, setDeleteBotId] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("keyData");
    if (!stored) {
      setLocation("/login");
      return;
    }
    const parsed = JSON.parse(stored);
    if (!parsed.isAdmin) {
      toast.error("غير مصرح لك بالوصول إلى هذه الصفحة");
      setLocation("/admin");
      return;
    }
    setKeyData(parsed);
  }, [setLocation]);

  const { data: bots, refetch } = trpc.bots.list.useQuery(undefined, {
    enabled: !!keyData,
  });

  const startMutation = trpc.bots.start.useMutation({
    onSuccess: () => {
      toast.success("تم تشغيل البوت بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "فشل تشغيل البوت");
    },
  });

  const stopMutation = trpc.bots.stop.useMutation({
    onSuccess: () => {
      toast.success("تم إيقاف البوت بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "فشل إيقاف البوت");
    },
  });

  const deleteMutation = trpc.bots.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف البوت بنجاح");
      refetch();
      setDeleteBotId(null);
    },
    onError: (error) => {
      toast.error(error.message || "فشل حذف البوت");
    },
  });

  const handleStart = (id: number) => {
    startMutation.mutate({ id });
  };

  const handleStop = (id: number) => {
    stopMutation.mutate({ id });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  if (!keyData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/admin")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">جميع البوتات</h1>
                <p className="text-sm text-gray-500">عرض وإدارة جميع البوتات في المنصة</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="elegant-card">
          <CardHeader>
            <CardTitle>جميع البوتات ({bots?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {bots && bots.length > 0 ? (
              <div className="space-y-3">
                {bots.map((bot) => (
                  <div
                    key={bot.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-lg">{bot.botName}</p>
                        {bot.status === "running" ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            يعمل
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                            متوقف
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground space-y-1">
                        <p>ADMIN UID: {bot.adminUid}</p>
                        <p>Account UID: {bot.accountUid}</p>
                        <p>تاريخ الإنشاء: {new Date(bot.createdAt).toLocaleDateString("ar-EG")}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {bot.status === "stopped" ? (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStart(bot.id)}
                          disabled={startMutation.isPending}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStop(bot.id)}
                          disabled={stopMutation.isPending}
                        >
                          <Square className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteBotId(bot.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                لا توجد بوتات بعد
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      <AlertDialog open={deleteBotId !== null} onOpenChange={() => setDeleteBotId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا البوت؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteBotId && handleDelete(deleteBotId)}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
