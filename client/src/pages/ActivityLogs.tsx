import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

interface ActivityLog {
  id: number;
  action: string;
  actionType: string;
  description?: string;
  status: string;
  createdAt: Date;
}

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export default function ActivityLogs() {
  const [, setLocation] = useLocation();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  useEffect(() => {
    // محاكاة جلب البيانات
    // في الواقع ستأتي من API
    setLogs([
      {
        id: 1,
        action: "create_bot",
        actionType: "create",
        description: "تم إنشاء بوت جديد: MyBot",
        status: "success",
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        id: 2,
        action: "update_bot",
        actionType: "update",
        description: "تم تحديث بوت: MyBot",
        status: "success",
        createdAt: new Date(Date.now() - 7200000),
      },
      {
        id: 3,
        action: "start_bot",
        actionType: "start",
        description: "تم تشغيل بوت: MyBot",
        status: "success",
        createdAt: new Date(Date.now() - 10800000),
      },
    ]);
    setLogsLoading(false);

    setNotifications([
      {
        id: 1,
        type: "bot_stopped",
        title: "توقف البوت",
        message: "توقف البوت MyBot بشكل غير متوقع",
        isRead: false,
        createdAt: new Date(Date.now() - 1800000),
      },
      {
        id: 2,
        type: "key_expiring",
        title: "انتهاء الصلاحية قريباً",
        message: "سينتهي مفتاحك خلال 7 أيام",
        isRead: true,
        createdAt: new Date(Date.now() - 86400000),
      },
    ]);
    setNotificationsLoading(false);
  }, []);

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case "create":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "update":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "delete":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case "bot_stopped":
        return "bg-red-100 text-red-800";
      case "key_expiring":
        return "bg-yellow-100 text-yellow-800";
      case "key_expired":
        return "bg-red-100 text-red-800";
      case "bot_error":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            رجوع
          </Button>
          <h1 className="text-2xl font-bold text-primary">سجل العمليات والإشعارات</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="logs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="logs">سجل العمليات</TabsTrigger>
            <TabsTrigger value="notifications">
              الإشعارات
              {notifications.filter((n) => !n.isRead).length > 0 && (
                <Badge variant="destructive" className="mr-2">
                  {notifications.filter((n) => !n.isRead).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="space-y-4">
            {logsLoading ? (
              <Card className="elegant-card">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">جاري التحميل...</p>
                </CardContent>
              </Card>
            ) : logs.length === 0 ? (
              <Card className="elegant-card">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">لا توجد عمليات مسجلة</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <Card key={log.id} className="elegant-card hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {getActionTypeIcon(log.actionType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">{log.action}</h3>
                            <Badge
                              variant={log.status === "success" ? "default" : "destructive"}
                            >
                              {log.status === "success" ? "نجح" : "فشل"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {log.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(log.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            {notificationsLoading ? (
              <Card className="elegant-card">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">جاري التحميل...</p>
                </CardContent>
              </Card>
            ) : notifications.length === 0 ? (
              <Card className="elegant-card">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">لا توجد إشعارات</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`elegant-card ${
                      !notification.isRead ? "border-l-4 border-l-primary" : ""
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">{notification.title}</h3>
                            <Badge className={getNotificationTypeColor(notification.type)}>
                              {notification.type === "bot_stopped"
                                ? "توقف البوت"
                                : notification.type === "key_expiring"
                                ? "انتهاء الصلاحية قريباً"
                                : notification.type === "key_expired"
                                ? "انتهت الصلاحية"
                                : "خطأ"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
