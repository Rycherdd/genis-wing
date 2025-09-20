import { 
  Users, 
  Calendar, 
  BookOpen, 
  FileText, 
  BarChart3, 
  Settings, 
  Home,
  GraduationCap,
  CreditCard,
  CheckCircle,
  Building
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", icon: Home, href: "/" },
  { label: "Professores", icon: Users, href: "/professores" },
  { label: "Turmas", icon: GraduationCap, href: "/turmas" },
  { label: "Cursos", icon: BookOpen, href: "/cursos" },
  { label: "Agenda", icon: Calendar, href: "/agenda" },
  { label: "Contratos", icon: FileText, href: "/contratos" },
  { label: "Pagamentos", icon: CreditCard, href: "/pagamentos" },
  { label: "Qualidade", icon: CheckCircle, href: "/qualidade" },
  { label: "Clientes", icon: Building, href: "/clientes" },
  { label: "Relatórios", icon: BarChart3, href: "/relatorios" },
  { label: "Configurações", icon: Settings, href: "/configuracoes" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card shadow-soft">
      {/* Logo/Header */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Do Genis</h1>
            <p className="text-xs text-muted-foreground">Sistema de Professores</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {sidebarItems.map((item, index) => {
          const isActive = location.pathname === item.href;
          return (
            <Button
              key={index}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11",
                isActive && "bg-gradient-primary shadow-soft"
              )}
              asChild
            >
              <Link to={item.href}>
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto rounded-full bg-accent px-2 py-1 text-xs text-accent-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
          <div className="h-8 w-8 rounded-full bg-gradient-primary"></div>
          <div className="flex-1">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@dogenis.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}