import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Professores from "./pages/Professores";
import Turmas from "./pages/Turmas";
import TurmasAluno from "./pages/TurmasAluno";
import Aulas from "./pages/Aulas";
import AulasAluno from "./pages/AulasAluno";
import Alunos from "./pages/Alunos";
import Presenca from "./pages/Presenca";
import MinhasPresencas from "./pages/MinhasPresencas";
import GerenciarConvites from "./pages/GerenciarConvites";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { userRole } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/" element={<ProtectedRoute><Layout><Index /></Layout></ProtectedRoute>} />
      {userRole !== 'aluno' ? (
        <>
          <Route path="/professores" element={<ProtectedRoute><Layout><Professores /></Layout></ProtectedRoute>} />
          <Route path="/alunos" element={<ProtectedRoute><Layout><Alunos /></Layout></ProtectedRoute>} />
          <Route path="/turmas" element={<ProtectedRoute><Layout><Turmas /></Layout></ProtectedRoute>} />
            <Route path="/aulas" element={<ProtectedRoute><Layout><Aulas /></Layout></ProtectedRoute>} />
            <Route path="/presenca" element={<ProtectedRoute><Layout><Presenca /></Layout></ProtectedRoute>} />
            <Route path="/convites" element={<ProtectedRoute><Layout><GerenciarConvites /></Layout></ProtectedRoute>} />
        </>
      ) : (
        <>
          <Route path="/turmas" element={<ProtectedRoute><Layout><TurmasAluno /></Layout></ProtectedRoute>} />
          <Route path="/aulas" element={<ProtectedRoute><Layout><AulasAluno /></Layout></ProtectedRoute>} />
          <Route path="/presencas" element={<ProtectedRoute><Layout><MinhasPresencas /></Layout></ProtectedRoute>} />
        </>
      )}
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
