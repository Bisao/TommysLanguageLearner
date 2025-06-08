import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AchievementBadge from "@/components/achievement-badge";
import LevelProgress from "@/components/level-progress";
import DailyStreak from "@/components/daily-streak";
import { 
  User, 
  Mail, 
  Trophy, 
  Target, 
  Calendar, 
  Settings, 
  Bell, 
  Shield,
  Flame,
  Star,
  Camera,
  Save,
  Edit,
  BarChart3,
  Award,
  Zap
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    dailyGoal: 15,
  });
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    streakReminder: true,
    achievementAlerts: true,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user data
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/user");
      return response.json();
    },
  });

  // Fetch user progress
  const { data: progress } = useQuery({
    queryKey: ["/api/progress"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/progress");
      return response.json();
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest("PATCH", "/api/user", updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    },
  });

  // Set form data when user data loads
  useState(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        dailyGoal: user.dailyGoal || 15,
      });
    }
  }, [user]);

  const handleSave = () => {
    updateUserMutation.mutate(formData);
  };

  const avatarOptions = [
    "🐱", "🐶", "🐸", "🐰", "🦊", "🐼", "🐨", "🦄", "🐷", "🐸", "🐯", "🦁"
  ];

  const [selectedAvatar, setSelectedAvatar] = useState("🐱");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cartoon-teal"></div>
      </div>
    );
  }

  // Sample achievements data
  const achievements = [
    {
      id: "first-lesson",
      name: "Primeira Lição",
      description: "Complete sua primeira lição",
      icon: "book",
      earned: true,
      rarity: "common" as const,
    },
    {
      id: "week-streak",
      name: "7 Dias Seguidos", 
      description: "Mantenha uma sequência de 7 dias",
      icon: "flame",
      earned: true,
      rarity: "rare" as const,
    },
    {
      id: "thousand-xp",
      name: "1000 XP",
      description: "Acumule 1000 pontos de experiência",
      icon: "star",
      earned: (user as any)?.totalXP >= 1000,
      progress: (user as any)?.totalXP || 0,
      total: 1000,
      rarity: "epic" as const,
    },
    {
      id: "word-master",
      name: "Mestre das Palavras",
      description: "Complete 50 lições de vocabulário",
      icon: "trophy",
      earned: false,
      progress: 23,
      total: 50,
      rarity: "legendary" as const,
    },
  ];

  return (
    <>
      <Header user={user} />
      <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
              Meu Perfil
            </h1>
            <p className="text-muted-foreground text-lg">
              Acompanhe seu progresso e conquistas no aprendizado
            </p>
          </motion.div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-96 mx-auto">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <User size={16} />
                <span className="hidden sm:inline">Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center space-x-2">
                <Trophy size={16} />
                <span className="hidden sm:inline">Conquistas</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center space-x-2">
                <BarChart3 size={16} />
                <span className="hidden sm:inline">Estatísticas</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings size={16} />
                <span className="hidden sm:inline">Configurações</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-1"
                >
                  <Card className="cartoon-card">
                    <CardContent className="p-6 text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="text-white" size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {(user as any)?.username || "Usuário"}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {(user as any)?.email || "email@exemplo.com"}
                      </p>
                      <div className="flex justify-center space-x-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-foreground">{(user as any)?.level || 1}</p>
                          <p className="text-xs text-muted-foreground">Nível</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-foreground">{(user as any)?.streak || 0}</p>
                          <p className="text-xs text-muted-foreground">Sequência</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Level Progress */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="lg:col-span-2"
                >
                  <LevelProgress
                    level={(user as any)?.level || 1}
                    currentXP={((user as any)?.totalXP || 0) % 1000}
                    xpForNextLevel={1000}
                    totalXP={(user as any)?.totalXP || 0}
                  />
                </motion.div>
              </div>

              {/* Daily Streak */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <DailyStreak
                  currentStreak={(user as any)?.streak || 0}
                  longestStreak={(user as any)?.streak || 0}
                  weeklyGoal={7}
                  weeklyProgress={5}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
              >
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AchievementBadge achievement={achievement} />
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="cartoon-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="text-blue-500" size={20} />
                      <span>Estatísticas Gerais</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">XP Total:</span>
                      <span className="font-semibold">{(user as any)?.totalXP || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nível Atual:</span>
                      <span className="font-semibold">{(user as any)?.level || 1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sequência:</span>
                      <span className="font-semibold">{(user as any)?.streak || 0} dias</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="cartoon-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="text-gray-500" size={20} />
                    <span>Configurações</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de usuário</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                      disabled={updateUserMutation.isPending}
                      className="cartoon-button"
                    >
                      {isEditing ? "Salvar" : "Editar Perfil"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold text-cartoon-dark flex items-center">
                  <User className="mr-2" size={24} />
                  Informações Pessoais
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={updateUserMutation.isPending}
                  className="border-cartoon-teal text-cartoon-teal hover:bg-cartoon-teal hover:text-white"
                >
                  {isEditing ? (
                    <>
                      <Save className="mr-2" size={16} />
                      Salvar
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2" size={16} />
                      Editar
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Selection */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarFallback className="text-4xl bg-cartoon-yellow">
                        {selectedAvatar}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                        variant="outline"
                      >
                        <Camera size={16} />
                      </Button>
                    )}
                  </div>

                  {isEditing && (
                    <div className="mt-4">
                      <Label className="text-sm font-semibold mb-2 block">
                        Escolha seu avatar:
                      </Label>
                      <div className="grid grid-cols-6 gap-2 max-w-xs mx-auto">
                        {avatarOptions.map((avatar, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedAvatar(avatar)}
                            className={`p-2 rounded-lg border-2 hover:border-cartoon-teal transition-colors ${
                              selectedAvatar === avatar 
                                ? "border-cartoon-teal bg-cartoon-teal/10" 
                                : "border-gray-200"
                            }`}
                          >
                            <span className="text-2xl">{avatar}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username" className="text-cartoon-dark font-semibold">
                      Nome de usuário
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-gray-400" size={20} />
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        disabled={!isEditing}
                        className="pl-10 border-2 border-gray-300 focus:border-cartoon-teal"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-cartoon-dark font-semibold">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="pl-10 border-2 border-gray-300 focus:border-cartoon-teal"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dailyGoal" className="text-cartoon-dark font-semibold">
                      Meta diária (XP)
                    </Label>
                    <div className="relative">
                      <Target className="absolute left-3 top-3 text-gray-400" size={20} />
                      <Input
                        id="dailyGoal"
                        type="number"
                        min="5"
                        max="100"
                        value={formData.dailyGoal}
                        onChange={(e) => setFormData(prev => ({ ...prev, dailyGoal: parseInt(e.target.value) }))}
                        disabled={!isEditing}
                        className="pl-10 border-2 border-gray-300 focus:border-cartoon-teal"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* User Stats */}
            <Card className="cartoon-card border-cartoon-blue">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-cartoon-dark flex items-center">
                  <Trophy className="mr-2" size={20} />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="text-cartoon-yellow" size={20} />
                    <span className="text-sm font-medium">XP Total</span>
                  </div>
                  <Badge className="bg-cartoon-yellow text-cartoon-dark">
                    {user?.totalXP || 0}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Flame className="text-cartoon-red" size={20} />
                    <span className="text-sm font-medium">Sequência</span>
                  </div>
                  <Badge className="bg-cartoon-red text-white">
                    {user?.streak || 0} dias
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trophy className="text-cartoon-blue" size={20} />
                    <span className="text-sm font-medium">Nível</span>
                  </div>
                  <Badge className="bg-cartoon-blue text-white">
                    {user?.level || 1}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-cartoon-mint" size={20} />
                    <span className="text-sm font-medium">Lições</span>
                  </div>
                  <Badge className="bg-cartoon-mint text-cartoon-dark">
                    {progress?.lessonsCompleted || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="cartoon-card border-cartoon-mint">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-cartoon-dark flex items-center">
                  <Trophy className="mr-2" size={20} />
                  Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user?.achievements?.map((achievement: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Trophy className="text-cartoon-yellow" size={16} />
                      <span className="text-sm capitalize">
                        {achievement.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500">
                      Nenhuma conquista ainda
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="cartoon-card border-cartoon-coral">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-cartoon-dark flex items-center">
                <Settings className="mr-2" size={24} />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notifications */}
              <div>
                <h3 className="text-lg font-semibold text-cartoon-dark mb-4 flex items-center">
                  <Bell className="mr-2" size={20} />
                  Notificações
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Lembrete diário</Label>
                      <p className="text-xs text-gray-500">
                        Receba lembretes para estudar todos os dias
                      </p>
                    </div>
                    <Switch
                      checked={notifications.dailyReminder}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, dailyReminder: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Lembrete de sequência</Label>
                      <p className="text-xs text-gray-500">
                        Alertas quando sua sequência estiver em risco
                      </p>
                    </div>
                    <Switch
                      checked={notifications.streakReminder}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, streakReminder: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Alertas de conquistas</Label>
                      <p className="text-xs text-gray-500">
                        Notificações quando ganhar uma nova conquista
                      </p>
                    </div>
                    <Switch
                      checked={notifications.achievementAlerts}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, achievementAlerts: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Privacy */}
              <div>
                <h3 className="text-lg font-semibold text-cartoon-dark mb-4 flex items-center">
                  <Shield className="mr-2" size={20} />
                  Privacidade
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Perfil público</Label>
                      <p className="text-xs text-gray-500">
                        Permitir que outros usuários vejam seu progresso
                      </p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Mostrar conquistas</Label>
                      <p className="text-xs text-gray-500">
                        Exibir suas conquistas no perfil público
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
    </>
  );
}