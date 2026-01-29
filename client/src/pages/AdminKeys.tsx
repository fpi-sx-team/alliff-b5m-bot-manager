import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Key, Plus, Trash2 } from "lucide-react";
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

export default function AdminKeys() {
  const [, setLocation] = useLocation();
  const [keyData, setKeyData] = useState<any>(null);
  const [deleteKeyId, setDeleteKeyId] = useState<number | null>(null);

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

  const { data: keys, refetch } = trpc.keys.list.useQuery(undefined, {
    enabled: !!keyData,
  });

  const deleteMutation = trpc.keys.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المفتاح بنجاح");
      refetch();
      setDeleteKeyId(null);
    },
    onError: (error) => {
      toast.error(error.message || "فشل حذف المفتاح");
    },
  });

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
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
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">إدارة المفاتيح</h1>
                <p className="text-sm text-gray-500">عرض وإدارة جميع المفاتيح</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-6">
          <Button onClick={() => setLocation("/admin/create-key")}>
            <Plus className="w-4 h-4 mr-2" />
            إنشاء مفتاح جديد
          </Button>
        </div>

        <Card className="elegant-card">
          <CardHeader>
            <CardTitle>جميع المفاتيح ({keys?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {keys && keys.length > 0 ? (
              <div className="space-y-3">
                {keys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-mono font-bold text-lg">{key.keyCode}</p>
                        {key.isAdmin && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                            أدمن
                          </span>
                        )}
                        {key.isActive ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                            نشط
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                            معطل
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground space-y-1">
                        <p>الحد الأقصى للبوتات: {key.maxBots}</p>
                        <p>تاريخ الانتهاء: {new Date(key.expiryDate).toLocaleDateString("ar-EG")}</p>
                        <p>تاريخ الإنشاء: {new Date(key.createdAt).toLocaleDateString("ar-EG")}</p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteKeyId(key.id)}
                      disabled={key.isAdmin}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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

      <AlertDialog open={deleteKeyId !== null} onOpenChange={() => setDeleteKeyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا المفتاح؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteKeyId && handleDelete(deleteKeyId)}
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
