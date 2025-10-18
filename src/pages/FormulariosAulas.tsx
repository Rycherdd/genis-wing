import { useState } from "react";
import { Search, Plus, MoreVertical, Edit, Trash2, Eye, Loader2, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useFormulariosAulas } from "@/hooks/useFormulariosAulas";
import { FormularioAulaForm } from "@/components/forms/FormularioAulaForm";
import { VerRespostasDialog } from "@/components/forms/VerRespostasDialog";
import { Formulario } from "@/hooks/useFormulariosAulas";

export default function FormulariosAulas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingFormulario, setEditingFormulario] = useState<Formulario | undefined>(undefined);
  const [viewingRespostas, setViewingRespostas] = useState<Formulario | null>(null);
  const { formularios, loading, deleteFormulario } = useFormulariosAulas();

  const filteredFormularios = formularios.filter(form =>
    form.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Formulários de Aulas</h1>
          <p className="text-muted-foreground">
            Gerencie os formulários de avaliação das aulas
          </p>
        </div>
        <Button onClick={() => {
          setEditingFormulario(undefined);
          setShowForm(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Formulário
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar formulários..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Formulários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formularios.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formulários Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formularios.filter(f => f.ativo).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formulários Inativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formularios.filter(f => !f.ativo).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulários List */}
      <div className="grid gap-4">
        {filteredFormularios.map((formulario) => (
          <Card key={formulario.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{formulario.titulo}</h3>
                    <Badge variant={formulario.ativo ? "default" : "secondary"}>
                      {formulario.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  {formulario.descricao && (
                    <p className="text-muted-foreground mb-3">{formulario.descricao}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formulario.perguntas.length} pergunta(s)</span>
                    <span>Criado em {(() => {
                      const date = new Date(formulario.created_at);
                      const [dateStr] = date.toISOString().split('T');
                      const [year, month, day] = dateStr.split('-');
                      return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('pt-BR');
                    })()}</span>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setViewingRespostas(formulario)}
                    >
                      <FileCheck className="mr-2 h-4 w-4" />
                      Ver Respostas
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingFormulario(formulario);
                        setShowForm(true);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => deleteFormulario(formulario.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFormularios.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm ? "Nenhum formulário encontrado." : "Nenhum formulário criado ainda."}
          </p>
        </div>
      )}

      <FormularioAulaForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingFormulario(undefined);
        }}
        formulario={editingFormulario}
      />

      <VerRespostasDialog
        open={!!viewingRespostas}
        onOpenChange={(open) => !open && setViewingRespostas(null)}
        formulario={viewingRespostas}
      />
    </div>
  );
}