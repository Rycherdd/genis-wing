import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function Agenda() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agenda</h1>
        <p className="text-muted-foreground">
          Visualize seus compromissos e horários
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendário de Atividades
          </CardTitle>
          <CardDescription>
            Seus compromissos e aulas programadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
              Agenda em desenvolvimento
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Esta funcionalidade será implementada em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}