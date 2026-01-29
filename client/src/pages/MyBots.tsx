import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft, Bot, Edit, Trash2, Play, Square } from "lucide-react";
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
import { toast } from "sonner";

export default function MyBots() {
  const [, setLocation] = useLocation();
  const [keyData, setKeyData] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("keyData");
    if (!stored) {
      setLocation("/login");
      return;
    }
    setKeyData(JSON.parse(stored));
  }, [setLocation]);

  const { data: bots, isLoading, refetch } = trpc.bots.list.useQuery(undefined, {
    enabled: !!keyData,
  });

  const deleteMutation = trpc.bots.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف البوت بنجاح");
      refetch();
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(error.message || "فشل حذف البوت");
    },
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

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const handleToggleStatus = (bot: any) => {
    if (bot.status === "running") {
      stopMutation.mutate({ id: bot.id });
    } else {
      startMutation.mutate({ id: bot.id });
    }
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
                <h1 className="text-xl font-bold text-gray-900">بوتاتي</h1>
                <p className="text-sm text-gray-500">إدارة جميع البوتات الخاصة بك</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
          </div>
        ) : bots && bots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((bot) => (
              <Card key={bot.id} className="elegant-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{bot.botName}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={bot.status === "running" ? "default" : "secondary"}>
                          {bot.status === "running" ? "يعمل" : "متوقف"}
                        </Badge>
                      </div>
                    </div>
                    <Bot className="w-8 h-8 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Admin UID:</span>
                      <span className="font-mono text-xs">{bot.adminUid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account UID:</span>
                      <span className="font-mono text-xs">{bot.accountUid}</span>
                    </div>
                    {bot.instagramUsername && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Instagram:</span>
                        <span className="text-xs">{bot.instagramUsername}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      size="sm"
                      variant={bot.status === "running" ? "destructive" : "default"}
                      className="flex-1"
                      onClick={() => handleToggleStatus(bot)}
                      disabled={startMutation.isPending || stopMutation.isPending}
                    >
                      {bot.status === "running" ? (
                        <>
                          <Square className="w-4 h-4 mr-1" />
                          إيقاف
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          تشغيل
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setLocation(`/edit-bot/${bot.id}`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteId(bot.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="elegant-card text-center py-12">
            <CardContent>
              <Bot className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد بوتات</h3>
              <p className="text-muted-foreground mb-4">
                لم تقم بإنشاء أي بوتات بعد
              </p>
              <Button onClick={() => setLocation("/create-bot")}>
                إنشاء بوت جديد
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-destructive font-semibold">
              تحذير: هذا الإجراء لا يمكن التراجع عنه!
            </AlertDialogDescription>
            <AlertDialogDescription>
              سيتم حذف البوت نهائياً ولن تتمكن من استعادته. هل أنت متأكد من رغبتك في المتابعة؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف البوت
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
