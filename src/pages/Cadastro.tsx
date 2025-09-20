import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, GraduationCap, ArrowLeft, Building, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface FormData {
  // Dados Pessoais
  nomeCompleto: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  
  // Dados Profissionais
  especialidades: string[];
  biografia: string;
  experiencia: string;
  formacao: string;
  certificacoes: string;
  
  // Preferências
  modalidade: string[];
  disponibilidade: string;
  tipoContrato: string;
  
  // Conta
  senha: string;
  confirmarSenha: string;
  aceitaTermos: boolean;
}

const especialidadesDisponiveis = [
  "Comunicação Empresarial",
  "Oratória",
  "Técnicas de Apresentação", 
  "Public Speaking",
  "Comunicação Digital",
  "Media Training",
  "Storytelling",
  "Comunicação Interpessoal",
  "Retórica",
  "Comunicação Não-Verbal"
];

export default function Cadastro() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, signUp } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState<FormData>({
    nomeCompleto: "",
    email: "",
    telefone: "",
    cpf: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    especialidades: [],
    biografia: "",
    experiencia: "",
    formacao: "",
    certificacoes: "",
    modalidade: [],
    disponibilidade: "",
    tipoContrato: "",
    senha: "",
    confirmarSenha: "",
    aceitaTermos: false,
  });

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleEspecialidade = (especialidade: string) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.includes(especialidade)
        ? prev.especialidades.filter(e => e !== especialidade)
        : [...prev.especialidades, especialidade]
    }));
  };

  const toggleModalidade = (modalidade: string) => {
    setFormData(prev => ({
      ...prev,
      modalidade: prev.modalidade.includes(modalidade)
        ? prev.modalidade.filter(m => m !== modalidade)
        : [...prev.modalidade, modalidade]
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.nomeCompleto && formData.email && formData.telefone && formData.cpf);
      case 2:
        return !!(formData.especialidades.length && formData.biografia && formData.experiencia);
      case 3:
        return !!(formData.modalidade.length && formData.disponibilidade && formData.tipoContrato);
      case 4:
        return !!(formData.senha && formData.confirmarSenha && formData.senha === formData.confirmarSenha && formData.aceitaTermos);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      // Show validation message without toast for now
      console.log("Please fill all required fields");
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      return;
    }

    setIsLoading(true);
    
    const { error } = await signUp(formData.email, formData.senha, formData.nomeCompleto);
    
    if (!error) {
      navigate("/login", { replace: true });
    }
    
    setIsLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="nomeCompleto"
                    value={formData.nomeCompleto}
                    onChange={(e) => updateFormData("nomeCompleto", e.target.value)}
                    className="pl-10"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    className="pl-10"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => updateFormData("telefone", e.target.value)}
                    className="pl-10"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => updateFormData("cpf", e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => updateFormData("endereco", e.target.value)}
                  className="pl-10"
                  placeholder="Rua, número, bairro"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => updateFormData("cidade", e.target.value)}
                  placeholder="São Paulo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select value={formData.estado} onValueChange={(value) => updateFormData("estado", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SP">São Paulo</SelectItem>
                    <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                    <SelectItem value="MG">Minas Gerais</SelectItem>
                    <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                    <SelectItem value="PR">Paraná</SelectItem>
                    <SelectItem value="SC">Santa Catarina</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => updateFormData("cep", e.target.value)}
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Especialidades * (selecione suas áreas de atuação)</Label>
              <div className="grid gap-2 md:grid-cols-2">
                {especialidadesDisponiveis.map((especialidade) => (
                  <div
                    key={especialidade}
                    onClick={() => toggleEspecialidade(especialidade)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.especialidades.includes(especialidade)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card hover:bg-muted border-border"
                    }`}
                  >
                    <span className="text-sm font-medium">{especialidade}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.especialidades.map((especialidade) => (
                  <Badge key={especialidade} variant="default">
                    {especialidade}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="biografia">Biografia Profissional *</Label>
              <Textarea
                id="biografia"
                value={formData.biografia}
                onChange={(e) => updateFormData("biografia", e.target.value)}
                placeholder="Conte um pouco sobre sua trajetória e experiência..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experiencia">Experiência (anos) *</Label>
              <Select value={formData.experiencia} onValueChange={(value) => updateFormData("experiencia", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua experiência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1">Menos de 1 ano</SelectItem>
                  <SelectItem value="1-3">1 a 3 anos</SelectItem>
                  <SelectItem value="3-5">3 a 5 anos</SelectItem>
                  <SelectItem value="5-10">5 a 10 anos</SelectItem>
                  <SelectItem value="10+">Mais de 10 anos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="formacao">Formação Acadêmica</Label>
              <Input
                id="formacao"
                value={formData.formacao}
                onChange={(e) => updateFormData("formacao", e.target.value)}
                placeholder="Ex: Graduação em Comunicação Social"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificacoes">Certificações</Label>
              <Textarea
                id="certificacoes"
                value={formData.certificacoes}
                onChange={(e) => updateFormData("certificacoes", e.target.value)}
                placeholder="Liste suas principais certificações..."
                rows={3}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Modalidade de Ensino * (selecione as preferidas)</Label>
              <div className="grid gap-3 md:grid-cols-3">
                {["Presencial", "Online", "Híbrido"].map((modalidade) => (
                  <div
                    key={modalidade}
                    onClick={() => toggleModalidade(modalidade)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors text-center ${
                      formData.modalidade.includes(modalidade)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card hover:bg-muted border-border"
                    }`}
                  >
                    <span className="font-medium">{modalidade}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="disponibilidade">Disponibilidade *</Label>
              <Select value={formData.disponibilidade} onValueChange={(value) => updateFormData("disponibilidade", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua disponibilidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manha">Manhã (8h às 12h)</SelectItem>
                  <SelectItem value="tarde">Tarde (13h às 17h)</SelectItem>
                  <SelectItem value="noite">Noite (18h às 22h)</SelectItem>
                  <SelectItem value="integral">Período Integral</SelectItem>
                  <SelectItem value="fins-semana">Fins de Semana</SelectItem>
                  <SelectItem value="flexivel">Horário Flexível</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoContrato">Tipo de Contratação *</Label>
              <Select value={formData.tipoContrato} onValueChange={(value) => updateFormData("tipoContrato", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Como prefere trabalhar?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pj">Pessoa Jurídica (PJ)</SelectItem>
                  <SelectItem value="autonomo">Autônomo</SelectItem>
                  <SelectItem value="clt">CLT</SelectItem>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senha">Senha *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  value={formData.senha}
                  onChange={(e) => updateFormData("senha", e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Digite uma senha segura"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                A senha deve ter pelo menos 8 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmarSenha"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmarSenha}
                  onChange={(e) => updateFormData("confirmarSenha", e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Digite a senha novamente"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="termos"
                checked={formData.aceitaTermos}
                onCheckedChange={(checked) => updateFormData("aceitaTermos", checked)}
                className="mt-1"
              />
              <Label htmlFor="termos" className="text-sm leading-relaxed cursor-pointer">
                Eu aceito os{" "}
                <Button variant="link" className="p-0 h-auto text-primary">
                  Termos de Uso
                </Button>{" "}
                e{" "}
                <Button variant="link" className="p-0 h-auto text-primary">
                  Política de Privacidade
                </Button>{" "}
                da plataforma Genis *
              </Label>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Resumo do seu cadastro:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong>Nome:</strong> {formData.nomeCompleto}</p>
                <p><strong>E-mail:</strong> {formData.email}</p>
                <p><strong>Especialidades:</strong> {formData.especialidades.join(", ")}</p>
                <p><strong>Modalidade:</strong> {formData.modalidade.join(", ")}</p>
                <p><strong>Disponibilidade:</strong> {formData.disponibilidade}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Dados Pessoais";
      case 2: return "Dados Profissionais";
      case 3: return "Preferências";
      case 4: return "Criar Conta";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Progress & Branding */}
      <div className="hidden lg:flex lg:w-1/3 bg-gradient-primary relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative flex flex-col justify-center w-full p-12">
          <div className="text-center text-white mb-8">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <GraduationCap className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Genis</h1>
            <p className="text-lg text-white/90">Cadastro de Professor</p>
          </div>

          {/* Progress Steps */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  step >= stepNumber 
                    ? "bg-white text-primary border-white" 
                    : "border-white/40 text-white/60"
                }`}>
                  {step > stepNumber ? "✓" : stepNumber}
                </div>
                <div className={`${step >= stepNumber ? "text-white" : "text-white/60"}`}>
                  <p className="font-medium">
                    {stepNumber === 1 && "Dados Pessoais"}
                    {stepNumber === 2 && "Dados Profissionais"}
                    {stepNumber === 3 && "Preferências"}
                    {stepNumber === 4 && "Criar Conta"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-2xl space-y-8">
          {/* Mobile Header */}
          <div className="text-center lg:hidden">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                <GraduationCap className="h-6 w-6" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Genis</h1>
            <p className="text-muted-foreground">Cadastro de Professor</p>
          </div>

          <Card className="bg-gradient-card shadow-large border-0">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-4">
                {step > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setStep(step - 1)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold">
                    {getStepTitle()}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Etapa {step} de 4
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                {renderStep()}

                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/login")}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  
                  {step < 4 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 bg-gradient-primary shadow-medium"
                      disabled={!validateStep(step)}
                    >
                      Próximo
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      className="flex-1 bg-gradient-success shadow-medium"
                      disabled={!validateStep(4) || isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Criando conta...
                        </div>
                      ) : (
                        "Criar Conta"
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground">
            <p>© 2024 Genis. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
}