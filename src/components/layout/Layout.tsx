import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { AIChatAssistant } from "./AIChatAssistant";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - hidden on mobile, slides in when open */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      <div className="flex flex-1 flex-col overflow-hidden w-full">
        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center p-4 border-b bg-card">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="ml-2 text-lg font-semibold">Genis</h1>
        </div>
        
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
      <AIChatAssistant />
    </div>
  );
}