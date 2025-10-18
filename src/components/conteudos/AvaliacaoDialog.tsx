import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Trophy } from "lucide-react";
import { useAvaliacoes, type Questao } from "@/hooks/useAvaliacoes";
import { useToast } from "@/hooks/use-toast";

interface AvaliacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avaliacaoId: string;
}

export function AvaliacaoDialog({ open, onOpenChange, avaliacaoId }: AvaliacaoDialogProps) {
  const { avaliacoes, submeterAvaliacao } = useAvaliacoes();
  const avaliacao = avaliacoes.find(a => a.id === avaliacaoId);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [respostas, setRespostas] = useState<{ questao_id: string; resposta_escolhida: number }[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [resultado, setResultado] = useState<{ nota: number; aprovado: boolean } | null>(null);
  const [startTime] = useState(Date.now());
  const { toast } = useToast();

  if (!avaliacao) return null;

  const questoes = avaliacao.questoes as Questao[];

  const handleResposta = (opcaoIndex: number) => {
    setRespostas(prev => {
      const existingIndex = prev.findIndex(r => r.questao_id === questoes[currentQuestion].id);
      const newResposta = {
        questao_id: questoes[currentQuestion].id,
        resposta_escolhida: opcaoIndex
      };

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newResposta;
        return updated;
      }
      return [...prev, newResposta];
    });
  };

  const getResposta = () => {
    return respostas.find(r => r.questao_id === questoes[currentQuestion].id)?.resposta_escolhida;
  };

  const handleNext = () => {
    if (currentQuestion < questoes.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const tempoGasto = Math.floor((Date.now() - startTime) / 1000);

    try {
      const result = await submeterAvaliacao(avaliacaoId, respostas, tempoGasto);
      
      if (result) {
        setResultado(result);
        setShowResult(true);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível submeter a avaliação",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setCurrentQuestion(0);
    setRespostas([]);
    setShowResult(false);
    setResultado(null);
    onOpenChange(false);
  };

  const questaoAtual = questoes[currentQuestion];
  const progress = ((currentQuestion + 1) / questoes.length) * 100;

  if (showResult && resultado) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Resultado da Avaliação</DialogTitle>
          </DialogHeader>
          <Card className={resultado.aprovado ? 'border-green-500' : 'border-red-500'}>
            <CardContent className="p-8 text-center space-y-4">
              {resultado.aprovado ? (
                <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 mx-auto text-red-500" />
              )}
              <div>
                <p className="text-4xl font-bold">{resultado.nota.toFixed(1)}%</p>
                <p className="text-muted-foreground mt-2">
                  {resultado.aprovado ? 'Aprovado!' : 'Reprovado'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Nota mínima necessária: {avaliacao.nota_minima}%
                </p>
                {resultado.aprovado && (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Trophy className="h-4 w-4 text-accent" />
                    <span>+{avaliacao.pontos_totais} pontos</span>
                  </div>
                )}
              </div>
              <Button onClick={handleClose} className="w-full">
                Fechar
              </Button>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{avaliacao.titulo}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Questão {currentQuestion + 1} de {questoes.length}
              </span>
              <span className="font-medium">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          {/* Questão */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">{questaoAtual.pergunta}</h3>

              <RadioGroup
                value={getResposta()?.toString() || ''}
                onValueChange={(value) => handleResposta(parseInt(value))}
              >
                <div className="space-y-3">
                  {questaoAtual.opcoes.map((opcao, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`q${currentQuestion}-${index}`} />
                      <Label 
                        htmlFor={`q${currentQuestion}-${index}`}
                        className="flex-1 cursor-pointer p-3 rounded border hover:bg-muted/50"
                      >
                        {opcao}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Anterior
            </Button>
            
            <div className="flex-1" />

            {currentQuestion < questoes.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={getResposta() === undefined}
              >
                Próxima
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={respostas.length !== questoes.length}
              >
                Finalizar Avaliação
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
