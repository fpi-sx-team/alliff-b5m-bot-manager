import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Bot, Key, Shield } from "lucide-react";

export default function Login() {
  const [keyCode, setKeyCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      // Store key info in localStorage
      localStorage.setItem("keyData", JSON.stringify(data.key));
      toast.success("تم تسجيل الدخول بنجاح!");
      
      // Redirect based on role
      if (data.key.isAdmin) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    },
    onError: (error) => {
      toast.error(error.message || "فشل تسجيل الدخول");
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyCode || !password) {
      toast.error("الرجاء إدخال المفتاح وكلمة المرور");
      return;
    }

    setIsLoading(true);
    loginMutation.mutate({ keyCode, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-lg mb-4">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Free Fire Bot Manager</h1>
          <p className="text-white/80">إدارة احترافية لبوتات Free Fire</p>
        </div>

        <Card className="elegant-card border-white/20 bg-white/10 backdrop-blur-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">تسجيل الدخول</CardTitle>
            <CardDescription className="text-white/70">
              أدخل مفتاح الوصول وكلمة المرور للمتابعة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyCode" className="text-white flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  مفتاح الوصول
                </Label>
                <Input
                  id="keyCode"
                  type="text"
                  placeholder="أدخل مفتاح الوصول"
                  value={keyCode}
                  onChange={(e) => setKeyCode(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  كلمة المرور
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-primary hover:bg-white/90"
                disabled={isLoading}
              >
                {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>


          </CardContent>
        </Card>

        <div className="mt-6 text-center text-white/60 text-sm">
          <p>تم التطوير بواسطة AlliFF</p>
          <p className="mt-1">Telegram: @AlliFF_BOT</p>
        </div>
      </div>
    </div>
  );
}
