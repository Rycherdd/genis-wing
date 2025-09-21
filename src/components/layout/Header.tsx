import { Bell, Search, User } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const pageNames: Record<string, string> = {
  "/": "Dashboard",
  "/professores": "Professores", 
  "/turmas": "Turmas",
  "/aulas": "Aulas",
  "/alunos": "Alunos",
  "/presenca": "Controle de Presença",
};

export function Header() {
  const location = useLocation();
  const currentPageName = pageNames[location.pathname] || "Página não encontrada";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6 shadow-soft">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">{currentPageName}</h2>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Buscar professores, turmas, cursos..." 
            className="pl-10"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive"></span>
        </Button>

        {/* Profile */}
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}