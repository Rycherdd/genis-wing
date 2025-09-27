import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Cadastro() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [inviteData, setInviteData] = useState<any>(null);
  const [loadingInvite, setLoadingInvite] = useState(true); // Changed to true by default
  const { signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  // Check for invite token on component mount - REQUIRED
  useEffect(() => {
    const token = searchParams.get('token');
    console.log("Token from URL:", token);
    if (token) {
      loadInviteData(token);
    } else {
      // No token provided, redirect to login with message
      console.log("No token in URL, redirecting to login");
      toast({
        title: "Acesso Negado",
        description: "Para criar uma conta, você precisa de um convite válido.",
        variant: "destructive",
      });
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate]);

  const loadInviteData = async (token: string) => {
    console.log("Loading invite data for token:", token);
    setLoadingInvite(true);
    try {
      // Use secure edge function instead of direct database query
      const { data, error } = await supabase.functions.invoke('validate-invite', {
        body: { token }
      });

      console.log("Validate invite response:", { data, error });

      if (error || !data?.valid) {
        console.log("Invite validation failed:", error || "Invalid response");
        toast({
          title: "Convite Inválido",
          description: "Este convite não é válido ou já expirou.",
          variant: "destructive",
        });
        return;
      }

      const inviteInfo = data.invite;
      console.log("Invite info received:", inviteInfo);
      setInviteData({ ...inviteInfo, token }); // Add token back for form submission
      setFormData(prev => ({
        ...prev,
        email: inviteInfo.email
      }));
      
      toast({
        title: "Convite Encontrado",
        description: `Você foi convidado para ser ${inviteInfo.role} por ${inviteInfo.invited_by_name || 'Sistema'}.`,
      });
    } catch (error) {
      console.error("Error loading invite:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o convite.",
        variant: "destructive",
      });
    } finally {
      setLoadingInvite(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não conferem.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const userRole = inviteData ? inviteData.role : 'user';
      const { error } = await signUp(formData.email, formData.password, formData.fullName, userRole);
      
      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Erro",
            description: "Este email já está cadastrado. Tente fazer login.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro",
            description: error.message || "Erro ao criar conta.",
            variant: "destructive",
          });
        }
      } else {
        // Mark invite as accepted - REQUIRED since we only allow invited users
        if (inviteData) {
          await supabase
            .from('convites')
            .update({
              status: 'aceito',
              accepted_at: new Date().toISOString(),
            })
            .eq('id', inviteData.id);
        }

        toast({
          title: "Sucesso",
          description: "Conta criada com sucesso! Verifique seu email para confirmar.",
        });
        navigate("/login");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingInvite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Carregando convite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-destructive mb-4" />
            <p>Convite não encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
              <Mail className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            Convite para {inviteData?.role === 'aluno' ? 'Aluno' : 'Professor'}
          </CardTitle>
          <CardDescription className="text-center">
            Você foi convidado por {inviteData?.invited_by_name || 'Sistema'}. Complete o cadastro para acessar o sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 rounded-lg bg-accent/20 border border-accent/30 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-accent" />
            <div className="text-sm">
              <p className="font-medium">Convite válido para {inviteData?.role || 'usuário'}</p>
              <p className="text-muted-foreground">Email: {inviteData?.email || ''}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Seu nome completo"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={true} // Always disabled since invite provides email
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Digite sua senha"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirme sua senha"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:opacity-90" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{" "}
            <Link to="/login" className="underline">
              Fazer login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}