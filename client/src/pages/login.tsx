import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, User, Lock, Mail, Maximize, Minimize } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Mascot from "@/components/mascot";
import tommyLogoPath from "@assets/Screenshot_2025-06-04_015828-removebg-preview.png";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [rememberUsername, setRememberUsername] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fullscreen functions
  const enterFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().then(() => setIsFullscreen(true));
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
      setIsFullscreen(true);
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen();
      setIsFullscreen(true);
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
      setIsFullscreen(false);
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Load saved data on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    const savedPassword = localStorage.getItem("savedPassword");
    const savedAutoLogin = localStorage.getItem("autoLogin") === "true";
    const savedRememberUsername = localStorage.getItem("rememberUsername") === "true";

    if (savedRememberUsername && savedUsername) {
      setFormData(prev => ({ ...prev, username: savedUsername }));
      setRememberUsername(true);
    }

    if (savedAutoLogin && savedPassword && savedUsername) {
      setFormData(prev => ({ ...prev, username: savedUsername, password: savedPassword }));
      setAutoLogin(true);
      // Auto-login after a short delay
      setTimeout(() => {
        loginMutation.mutate({
          username: savedUsername,
          password: savedPassword,
        });
      }, 1000);
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo de volta, ${data.user.username}!`,
      });

      // Save preferences
      if (rememberUsername) {
        localStorage.setItem("rememberedUsername", formData.username);
        localStorage.setItem("rememberUsername", "true");
      } else {
        localStorage.removeItem("rememberedUsername");
        localStorage.setItem("rememberUsername", "false");
      }

      if (autoLogin) {
        localStorage.setItem("savedPassword", formData.password);
        localStorage.setItem("autoLogin", "true");
      } else {
        localStorage.removeItem("savedPassword");
        localStorage.setItem("autoLogin", "false");
      }

      // Enter fullscreen and navigate
      setTimeout(() => {
        enterFullscreen();
      }, 500);

      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setTimeout(() => {
        setLocation("/home");
      }, 1000);
    },
    onError: (error: any) => {
      setError("Usuário ou senha incorretos. Tente novamente.");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo, ${data.user.username}!`,
      });

      setTimeout(() => {
        enterFullscreen();
      }, 500);

      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setTimeout(() => {
        setLocation("/home");
      }, 1000);
    },
    onError: (error: any) => {
      setError("Erro ao criar conta. Tente novamente.");
    },
  });

  const guestLoginMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/guest-login", {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Entrando como convidado!",
        description: "Explore o Tommy's Academy!",
      });

      setTimeout(() => {
        enterFullscreen();
      }, 500);

      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setTimeout(() => {
        setLocation("/home");
      }, 1000);
    },
    onError: (error: any) => {
      setError("Erro ao entrar como convidado. Tente novamente.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      if (!formData.username || !formData.password) {
        setError("Por favor, preencha todos os campos");
        return;
      }
      loginMutation.mutate({
        username: formData.username,
        password: formData.password,
      });
    } else {
      if (!formData.username || !formData.email || !formData.password) {
        setError("Por favor, preencha todos os campos");
        return;
      }
      registerMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* Fullscreen Toggle Button */}
      <Button
        onClick={toggleFullscreen}
        className="fixed top-4 right-4 z-50 btn-secondary touch-friendly"
        size="sm"
        title={isFullscreen ? "Sair do modo fullscreen" : "Entrar em modo fullscreen"}
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </Button>

      {/* Scrollable Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 mb-4">
                <img 
                  src={tommyLogoPath} 
                  alt="Tommy's Academy Logo" 
                  className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain"
                />
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold gradient-text text-center">Tommy's Academy</h1>
              </div>

              <p className="text-sm sm:text-base text-muted-foreground px-2">
                {isLogin ? "Entre na sua conta" : "Crie sua conta"} e continue sua jornada de aprendizado!
              </p>
            </div>

            {/* Login/Register Card */}
            <Card className="card-elevated shadow-lg mb-6">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                  {isLogin ? "Entrar" : "Criar Conta"}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-700 dark:text-gray-300 font-semibold">
                      Nome de usuário
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-gray-400" size={20} />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Digite seu nome de usuário"
                        className="input-modern pl-10 h-12 text-base touch-friendly"
                        value={formData.username}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  {/* Email (only for register) */}
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-semibold">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Digite seu email"
                          className="input-modern pl-10 h-12 text-base touch-friendly"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          autoComplete="email"
                        />
                      </div>
                    </div>
                  )}

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-semibold">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Digite sua senha"
                        className="input-modern pl-10 h-12 text-base touch-friendly"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        autoComplete={isLogin ? "current-password" : "new-password"}
                      />
                    </div>
                  </div>

                  {/* Options (only for login) */}
                  {isLogin && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember"
                          checked={rememberUsername}
                          onCheckedChange={(checked) => setRememberUsername(checked as boolean)}
                          className="touch-friendly"
                        />
                        <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">
                          Lembrar nome de usuário
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="autologin"
                          checked={autoLogin}
                          onCheckedChange={(checked) => setAutoLogin(checked as boolean)}
                          className="touch-friendly"
                        />
                        <Label htmlFor="autologin" className="text-sm text-gray-600 dark:text-gray-400">
                          Login automático
                        </Label>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                      <AlertDescription className="text-red-700 dark:text-red-300">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="btn-primary w-full h-12 text-base touch-friendly"
                    disabled={loginMutation.isPending || registerMutation.isPending}
                  >
                    {(loginMutation.isPending || registerMutation.isPending) ? "Carregando..." : (isLogin ? "Entrar" : "Criar Conta")}
                  </Button>

                  {/* Toggle Mode */}
                  <div className="text-center pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setError("");
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm touch-friendly"
                    >
                      {isLogin ? "Não tem uma conta? Criar conta" : "Já tem uma conta? Entrar"}
                    </button>
                  </div>
                </form>

                {/* Guest Login */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={() => guestLoginMutation.mutate()}
                    variant="outline"
                    className="w-full h-12 text-base touch-friendly"
                    disabled={guestLoginMutation.isPending}
                  >
                    {guestLoginMutation.isPending ? "Carregando..." : "Entrar como Convidado"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}