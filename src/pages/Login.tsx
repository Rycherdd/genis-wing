import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, GraduationCap, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("professor");
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    if (!isLogin && (!fullName || password !== confirmPassword)) {
      return;
    }
    
    setIsLoading(true);
    
    if (isLogin) {
      const { error } = await signIn(email, password);
      if (!error) {
        navigate("/", { replace: true });
      }
    } else {
      const { error } = await signUp(email, password, fullName, role);
      if (!error) {
        setIsLogin(true);
        setEmail("");
        setPassword("");
        setFullName("");
        setConfirmPassword("");
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative flex items-center justify-center w-full p-12">
          <div className="text-center text-white">
            <div className="flex justify-center mb-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <GraduationCap className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Genis - Gestão de Professores</h1>
            <p className="text-xl mb-2 text-white/90">Sistema de Gestão de Professores</p>
            <p className="text-lg mb-6 text-white/80 font-medium">Para uso interno exclusivo</p>
            <div className="mb-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <p className="text-white font-semibold text-center">
                "Transformando a educação através da tecnologia"
              </p>
            </div>
            <div className="space-y-4 text-white/80">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white/60"></div>
                <span>Gerencie professores e turmas</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white/60"></div>
                <span>Controle de agenda e presença</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white/60"></div>
                <span>Relatórios e análises detalhadas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-background via-background to-muted/30">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Header */}
          <div className="text-center lg:hidden">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                <GraduationCap className="h-6 w-6" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Genis - Gestão de Professores</h1>
            <p className="text-muted-foreground">Sistema de Gestão de Professores</p>
            <p className="text-sm text-muted-foreground/80 mt-1">Para uso interno exclusivo</p>
          </div>

          <Card className="bg-gradient-to-br from-card to-card/50 shadow-large border border-primary/10 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                {isLogin ? "Fazer Login" : "Criar Conta"}
              </CardTitle>
              <p className="text-center text-muted-foreground">
                {isLogin 
                  ? "Entre com suas credenciais para acessar o sistema"
                  : "Cadastre-se para começar a usar o sistema"
                }
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Role Selection - Only for Signup */}
                {!isLogin && (
                  <div className="space-y-3">
                    <Label>Tipo de Conta</Label>
                    <RadioGroup value={role} onValueChange={setRole} className="flex gap-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="professor" id="professor" />
                        <Label htmlFor="professor" className="cursor-pointer">Professor</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="aluno" id="aluno" />
                        <Label htmlFor="aluno" className="cursor-pointer">Aluno</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Full Name - Only for Signup */}
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <div className="relative">
                      <UserCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Seu nome completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password - Only for Signup */}
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirme sua senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {/* Remember Me & Forgot Password - Only for Login */}
                {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Lembrar de mim
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 text-sm text-primary hover:text-primary-hover"
                  >
                    Esqueceu a senha?
                  </Button>
                </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary via-primary to-primary-hover text-primary-foreground shadow-medium hover:shadow-large hover:from-primary-hover hover:to-primary transition-all duration-300 font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      {isLogin ? "Entrando..." : "Criando conta..."}
                    </div>
                  ) : (
                    isLogin ? "Entrar no Sistema" : "Criar Conta"
                  )}
                </Button>

              </form>

              <div className="text-center text-xs text-muted-foreground">
                <span className="text-muted-foreground">
                  {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
                </span>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 text-primary hover:text-primary-hover font-medium"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Criar Conta" : "Fazer Login"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground">
            <p>© 2024 Genis - Gestão de Professores. Todos os direitos reservados.</p>
            <div className="flex justify-center gap-4 mt-2">
              <Button variant="link" className="p-0 text-xs text-muted-foreground">
                Termos de Uso
              </Button>
              <Button variant="link" className="p-0 text-xs text-muted-foreground">
                Política de Privacidade
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}