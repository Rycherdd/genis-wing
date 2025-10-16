import { useState } from "react";
import { Search, CheckCircle2, Clock, Loader2, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFormulariosAulas, Formulario } from "@/hooks/useFormulariosAulas";
import { useRespostasFormularios } from "@/hooks/useRespostasFormularios";

export default function FormulariosAluno() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFormulario, setSelectedFormulario] = useState<Formulario | null>(null);
  const [respostas, setRespostas] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  
  const { formularios, loading } = useFormulariosAulas();
  const { submitResposta, minhaResposta } = useRespostasFormularios(selectedFormulario?.id);

  const filteredFormularios = formularios.filter(form =>
    form.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenFormulario = (formulario: Formulario) => {
    setSelectedFormulario(formulario);
    setRespostas({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFormulario) return;

    setSubmitting(true);
    try {
      await submitResposta(respostas);
      setSelectedFormulario(null);
      setRespostas({});
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
    } finally {
      setSubmitting(false);
    }
  };

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
      <div>
        <h1 className="text-3xl font-bold">Formulários de Avaliação</h1>
        <p className="text-muted-foreground">
          Responda aos formulários de avaliação das aulas
        </p>
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

      {/* Formulários List */}
      <div className="grid gap-4">
        {filteredFormularios.map((formulario) => {
          const jaRespondido = false; // TODO: Verificar se já respondeu
          
          return (
            <Card key={formulario.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <CardTitle>{formulario.titulo}</CardTitle>
                      {jaRespondido && (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Respondido
                        </Badge>
                      )}
                    </div>
                    {formulario.descricao && (
                      <CardDescription className="mt-2">{formulario.descricao}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formulario.perguntas.length} pergunta(s)</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      ~{formulario.perguntas.length * 2} min
                    </span>
                  </div>
                  <Button 
                    onClick={() => handleOpenFormulario(formulario)}
                    variant={jaRespondido ? "outline" : "default"}
                  >
                    {jaRespondido ? "Ver Resposta" : "Responder"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredFormularios.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {searchTerm ? "Nenhum formulário encontrado." : "Não há formulários disponíveis no momento."}
          </p>
        </div>
      )}

      {/* Dialog para responder formulário */}
      <Dialog open={!!selectedFormulario} onOpenChange={(open) => !open && setSelectedFormulario(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedFormulario?.titulo}</DialogTitle>
            <DialogDescription>{selectedFormulario?.descricao}</DialogDescription>
          </DialogHeader>
          
          {selectedFormulario && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {selectedFormulario.perguntas.map((pergunta, index) => (
                <div key={pergunta.id} className="space-y-3">
                  <Label className="text-base">
                    {index + 1}. {pergunta.texto}
                    {pergunta.obrigatoria && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  
                  {pergunta.tipo === 'texto' && (
                    <Textarea
                      placeholder="Digite sua resposta..."
                      value={respostas[pergunta.id] || ''}
                      onChange={(e) => setRespostas({ ...respostas, [pergunta.id]: e.target.value })}
                      required={pergunta.obrigatoria}
                      rows={3}
                    />
                  )}
                  
                  {pergunta.tipo === 'multipla_escolha' && (
                    <RadioGroup
                      value={respostas[pergunta.id]}
                      onValueChange={(value) => setRespostas({ ...respostas, [pergunta.id]: value })}
                      required={pergunta.obrigatoria}
                    >
                      {(pergunta.opcoes || []).map((opcao, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <RadioGroupItem value={opcao} id={`${pergunta.id}-${idx}`} />
                          <Label htmlFor={`${pergunta.id}-${idx}`} className="font-normal">
                            {opcao}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                  
                  {pergunta.tipo === 'nota' && (
                    <RadioGroup
                      value={respostas[pergunta.id]?.toString()}
                      onValueChange={(value) => setRespostas({ ...respostas, [pergunta.id]: parseInt(value) })}
                      required={pergunta.obrigatoria}
                      className="flex gap-2"
                    >
                      {[1, 2, 3, 4, 5].map((nota) => (
                        <div key={nota} className="flex flex-col items-center">
                          <RadioGroupItem value={nota.toString()} id={`${pergunta.id}-${nota}`} />
                          <Label htmlFor={`${pergunta.id}-${nota}`} className="font-normal mt-1">
                            {nota}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>
              ))}
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelectedFormulario(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Enviando..." : "Enviar Respostas"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}