import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Professores from "./pages/Professores";
import Turmas from "./pages/Turmas";
import TurmasAluno from "./pages/TurmasAluno";
import Aulas from "./pages/Aulas";
import AulasAluno from "./pages/AulasAluno";
import Avisos from "./pages/Avisos";
import Alunos from "./pages/Alunos";
import Presenca from "./pages/Presenca";
import MinhasPresencas from "./pages/MinhasPresencas";
import MeuProgresso from "./pages/MeuProgresso";
import GerenciarConvites from "./pages/GerenciarConvites";
import GerenciarUsuarios from "./pages/GerenciarUsuarios";
import Agenda from "./pages/Agenda";
import FormulariosAulas from "./pages/FormulariosAulas";
import FormulariosAluno from "./pages/FormulariosAluno";
import Gamificacao from "./pages/Gamificacao";
import ConteudosComplementares from "./pages/ConteudosComplementares";
import GerenciarConteudos from "./pages/GerenciarConteudos";
import CheckinAluno from "./pages/CheckinAluno";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/" element={<ProtectedRoute><Layout><Index /></Layout></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/professores" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Professores /></Layout></ProtectedRoute>} />
      <Route path="/gerenciar-convites" element={<ProtectedRoute allowedRoles={['admin']}><Layout><GerenciarConvites /></Layout></ProtectedRoute>} />
      <Route path="/gerenciar-usuarios" element={<ProtectedRoute allowedRoles={['admin']}><Layout><GerenciarUsuarios /></Layout></ProtectedRoute>} />
      
      {/* Admin & Professor Routes */}
      <Route path="/alunos" element={<ProtectedRoute allowedRoles={['admin', 'professor']}><Layout><Alunos /></Layout></ProtectedRoute>} />
      <Route path="/turmas" element={<ProtectedRoute allowedRoles={['admin', 'professor']}><Layout><Turmas /></Layout></ProtectedRoute>} />
      <Route path="/aulas" element={<ProtectedRoute allowedRoles={['admin', 'professor']}><Layout><Aulas /></Layout></ProtectedRoute>} />
      <Route path="/presenca" element={<ProtectedRoute allowedRoles={['admin', 'professor']}><Layout><Presenca /></Layout></ProtectedRoute>} />
      <Route path="/agenda" element={<ProtectedRoute allowedRoles={['admin', 'professor', 'aluno']}><Layout><Agenda /></Layout></ProtectedRoute>} />
      <Route path="/formularios" element={<ProtectedRoute allowedRoles={['admin', 'professor']}><Layout><FormulariosAulas /></Layout></ProtectedRoute>} />
      <Route path="/gerenciar-conteudos" element={<ProtectedRoute allowedRoles={['admin', 'professor']}><Layout><GerenciarConteudos /></Layout></ProtectedRoute>} />
      
      {/* All authenticated users */}
      <Route path="/turmas-aluno" element={<ProtectedRoute><Layout><TurmasAluno /></Layout></ProtectedRoute>} />
      
      {/* Student Routes */}
      <Route path="/aulas-aluno" element={<ProtectedRoute allowedRoles={['aluno']}><Layout><AulasAluno /></Layout></ProtectedRoute>} />
      <Route path="/minhas-presencas" element={<ProtectedRoute allowedRoles={['aluno']}><Layout><MinhasPresencas /></Layout></ProtectedRoute>} />
      <Route path="/meu-progresso" element={<ProtectedRoute allowedRoles={['aluno']}><Layout><MeuProgresso /></Layout></ProtectedRoute>} />
      <Route path="/formularios-aluno" element={<ProtectedRoute allowedRoles={['aluno']}><Layout><FormulariosAluno /></Layout></ProtectedRoute>} />
      <Route path="/conteudos" element={<ProtectedRoute allowedRoles={['aluno']}><Layout><ConteudosComplementares /></Layout></ProtectedRoute>} />
      <Route path="/checkin" element={<ProtectedRoute><Layout><CheckinAluno /></Layout></ProtectedRoute>} />
      <Route path="/avisos" element={<ProtectedRoute><Layout><Avisos /></Layout></ProtectedRoute>} />
      
      {/* Gamification - accessible to all */}
      <Route path="/gamificacao" element={<ProtectedRoute><Layout><Gamificacao /></Layout></ProtectedRoute>} />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
