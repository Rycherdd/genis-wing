import { Bell, Search, User } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfileDialog } from "@/components/profile/ProfileDialog";
import { NotificationsDialog } from "@/components/layout/NotificationsDialog";
import { useNotifications } from "@/hooks/useNotifications";

const pageNames: Record<string, string> = {
  "/": "Dashboard",
  "/professores": "Mentores", 
  "/turmas": "Turmas",
  "/turmas-aluno": "Minhas Turmas",
  "/aulas": "Aulas",
  "/aulas-aluno": "Minhas Aulas",
  "/alunos": "Alunos",
  "/presenca": "Controle de Presença",
  "/minhas-presencas": "Minhas Presenças",
  "/gerenciar-convites": "Gerenciar Convites",
  "/gerenciar-usuarios": "Gerenciar Usuários",
  "/agenda": "Agenda",
  "/gamificacao": "Gamificação",
  "/avisos": "Avisos",
  "/formularios": "Formulários",
  "/formularios-aluno": "Meus Formulários",
  "/meu-progresso": "Meu Progresso",
  "/conteudos": "Conteúdos Complementares",
  "/gerenciar-conteudos": "Gerenciar Conteúdos",
  "/login": "Login",
  "/cadastro": "Cadastro",
};

export function Header() {
  const location = useLocation();
  const currentPageName = pageNames[location.pathname] || "Página não encontrada";
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <>
      <header className="hidden lg:flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 shadow-soft">
        <div className="flex items-center gap-4">
          <h2 className="text-lg md:text-xl font-semibold truncate">{currentPageName}</h2>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search - hidden on mobile */}
          <div className="hidden md:block relative w-64 lg:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar professores, turmas, cursos..." 
              className="pl-10"
            />
          </div>

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => setNotificationsOpen(true)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          {/* Profile */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setProfileDialogOpen(true)}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      <ProfileDialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen} />
      <NotificationsDialog open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </>
  );
}