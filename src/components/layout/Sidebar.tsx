import { useState } from "react";
import { Home, Users, BookOpen, Calendar, FileText, CreditCard, BarChart3, UserCircle, Settings, LogOut, Badge, GraduationCap, CheckCircle, Building, Mail, UserCog, CalendarDays, CheckSquare } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleNavigation } from "@/hooks/useRoleNavigation";
import { ProfileDialog } from "@/components/profile/ProfileDialog";
import { useProfile } from "@/hooks/useProfile";

const iconMap = {
  Home,
  Users,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckSquare,
  CheckCircle,
  Settings,
  Mail,
  UserCog,
  GraduationCap,
};

interface NavigationItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

export function Sidebar() {
  const location = useLocation();
  const { user, signOut, userRole } = useAuth();
  const { navigationItems } = useRoleNavigation();
  const { profile } = useProfile();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const getInitials = () => {
    const name = profile?.full_name || user?.email || "U";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card shadow-soft">
      {/* Logo/Header */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Genis</h1>
            <p className="text-xs text-muted-foreground">Sistema Educacional</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item, index) => {
          const IconComponent = iconMap[item.icon as keyof typeof iconMap];
          const isActive = location.pathname === item.url;
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
              <Link to={item.url}>
                {IconComponent && <IconComponent className="h-5 w-5" />}
                <span className="font-medium">{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t">
        {/* User Info - Clicável */}
        <button
          onClick={() => setProfileDialogOpen(true)}
          className="flex items-center gap-3 p-3 border-b w-full hover:bg-muted/50 transition-colors"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium truncate">
              {profile?.full_name || user?.user_metadata?.full_name || 'Usuário'}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            <p className="text-xs text-primary font-medium capitalize">
              {userRole || 'Carregando...'}
            </p>
          </div>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Logout Button */}
        <div className="p-3 pt-0">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground" 
            size="sm"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>

      {/* Profile Dialog */}
      <ProfileDialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen} />
    </div>
  );
}