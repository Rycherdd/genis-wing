import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, TrendingUp, Users, Award } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from "recharts";

// Mock data - 18 competências
const competencias = [
  "Linguagem não verbal",
  "Repertório",
  "Posicionamento",
  "Leitura",
  "Voz",
  "Autoconfiança",
  "Networking",
  "Respiração",
  "Estrutura de Raciocínio",
  "Marketing Pessoal",
  "Persuasão",
  "Liderança",
  "Fluência",
  "Escutatória",
  "Ambiência",
  "Criatividade",
  "Dicção",
  "Didática",
];

// Dados mockados para "Antes" (Janeiro 2025)
const dadosAntes = competencias.map((comp, index) => ({
  competencia: comp,
  valor: Math.floor(Math.random() * 150) + 200, // valores entre 200-350
  fullMark: 400,
}));

// Dados mockados para "Depois" (Abril 2025) - com evolução
const dadosDepois = competencias.map((comp, index) => ({
  competencia: comp,
  valor: dadosAntes[index].valor + Math.floor(Math.random() * 80) + 20, // evolução de 20-100 pontos
  fullMark: 400,
}));

// Dados combinados para comparação
const dadosComparacao = competencias.map((comp, index) => ({
  competencia: comp,
  antes: dadosAntes[index].valor,
  depois: dadosDepois[index].valor,
  fullMark: 400,
}));

const alunos = [
  { id: "1", nome: "Adriano José de Oliveira" },
  { id: "2", nome: "Alessandra Cristina Santos" },
  { id: "3", nome: "Andrew Ruan Santos" },
  { id: "4", nome: "Anna Clara de Castro" },
  { id: "5", nome: "Camila Tainara Lopes" },
  { id: "6", nome: "Caroline dos Santos" },
];

const professores = [
  { id: "1", nome: "Gabriel" },
  { id: "2", nome: "Ricardo" },
];

const turmas = [
  { id: "1", nome: "In Company" },
  { id: "2", nome: "Mentoria Online" },
  { id: "3", nome: "Tríade Presencial" },
];

export default function RadarCompetencias() {
  const [selectedAluno, setSelectedAluno] = useState<string>("1");
  const [selectedProfessor, setSelectedProfessor] = useState<string>("1");
  const [selectedTurma, setSelectedTurma] = useState<string>("1");
  const [dataAntes, setDataAntes] = useState<Date | undefined>(new Date(2025, 0, 15)); // 15 jan 2025
  const [dataDepois, setDataDepois] = useState<Date | undefined>(new Date(2025, 3, 23)); // 23 abr 2025
  const [periodo, setPeriodo] = useState<"antes" | "depois" | "comparacao">("comparacao");

  // Calcular métricas
  const calcularMedia = (dados: typeof dadosAntes) => {
    const soma = dados.reduce((acc, item) => acc + item.valor, 0);
    return Math.round(soma / dados.length);
  };

  const mediaAntes = calcularMedia(dadosAntes);
  const mediaDepois = calcularMedia(dadosDepois);
  const evolucao = ((mediaDepois - mediaAntes) / mediaAntes * 100).toFixed(1);

  const alunoSelecionado = alunos.find(a => a.id === selectedAluno);
  const professorSelecionado = professores.find(p => p.id === selectedProfessor);
  const turmaSelecionada = turmas.find(t => t.id === selectedTurma);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Radar de Competências</h1>
        <p className="text-muted-foreground">
          Visualize a evolução das competências ao longo do tempo
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Selecione os parâmetros para análise</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro Aluno */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Aluno</label>
              <Select value={selectedAluno} onValueChange={setSelectedAluno}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent>
                  {alunos.map((aluno) => (
                    <SelectItem key={aluno.id} value={aluno.id}>
                      {aluno.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Professor */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Professor</label>
              <Select value={selectedProfessor} onValueChange={setSelectedProfessor}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um professor" />
                </SelectTrigger>
                <SelectContent>
                  {professores.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Turma */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Turma</label>
              <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma turma" />
                </SelectTrigger>
                <SelectContent>
                  {turmas.map((turma) => (
                    <SelectItem key={turma.id} value={turma.id}>
                      {turma.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Seleção de Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Inicial (Antes)</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataAntes && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataAntes ? format(dataAntes, "PPP", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataAntes}
                    onSelect={setDataAntes}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Final (Depois)</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataDepois && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataDepois ? format(dataDepois, "PPP", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataDepois}
                    onSelect={setDataDepois}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Média Antes</p>
                <p className="text-3xl font-bold">{mediaAntes}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dataAntes ? format(dataAntes, "PP", { locale: ptBR }) : "-"}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Média Depois</p>
                <p className="text-3xl font-bold">{mediaDepois}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dataDepois ? format(dataDepois, "PP", { locale: ptBR }) : "-"}
                </p>
              </div>
              <Award className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Evolução</p>
                <p className="text-3xl font-bold text-accent">+{evolucao}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Crescimento médio
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Radar */}
      <Card>
        <CardHeader>
          <CardTitle>Radar de Competências - {alunoSelecionado?.nome}</CardTitle>
          <CardDescription>
            Professor: {professorSelecionado?.nome} | Turma: {turmaSelecionada?.nome}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={periodo} onValueChange={(v) => setPeriodo(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="antes">Antes</TabsTrigger>
              <TabsTrigger value="depois">Depois</TabsTrigger>
              <TabsTrigger value="comparacao">Comparação</TabsTrigger>
            </TabsList>

            <TabsContent value="antes" className="h-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={dadosAntes}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis 
                    dataKey="competencia" 
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 400]} />
                  <Radar
                    name="Antes"
                    dataKey="valor"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="depois" className="h-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={dadosDepois}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis 
                    dataKey="competencia" 
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 400]} />
                  <Radar
                    name="Depois"
                    dataKey="valor"
                    stroke="hsl(var(--accent))"
                    fill="hsl(var(--accent))"
                    fillOpacity={0.6}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="comparacao" className="h-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={dadosComparacao}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis 
                    dataKey="competencia" 
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 400]} />
                  <Radar
                    name="Antes"
                    dataKey="antes"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Depois"
                    dataKey="depois"
                    stroke="hsl(var(--accent))"
                    fill="hsl(var(--accent))"
                    fillOpacity={0.3}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Pilares DNA Genis */}
      <Card>
        <CardHeader>
          <CardTitle>Pilares DNA Genis</CardTitle>
          <CardDescription>Competências organizadas por pilar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-primary">Interpessoal</h3>
              <div className="space-y-2 text-sm">
                <p>• Liderança</p>
                <p>• Persuasão</p>
                <p>• Marketing Pessoal</p>
                <p>• Networking</p>
                <p>• Escutatória</p>
                <p>• Ambiência</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-accent">Intrapessoal</h3>
              <div className="space-y-2 text-sm">
                <p>• Autoconfiança</p>
                <p>• Estrutura de Raciocínio</p>
                <p>• Criatividade</p>
                <p>• Leitura</p>
                <p>• Repertório</p>
                <p>• Posicionamento</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-secondary">Oratória</h3>
              <div className="space-y-2 text-sm">
                <p>• Voz</p>
                <p>• Respiração</p>
                <p>• Fluência</p>
                <p>• Dicção</p>
                <p>• Didática</p>
                <p>• Linguagem não verbal</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
