import { Card, CardContent } from "@/components/ui/card";
import { Badge as BadgeType, UserBadge } from "@/hooks/useGamification";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BadgeGridProps {
  userBadges: UserBadge[];
  allBadges: BadgeType[];
}

export function BadgeGrid({ userBadges, allBadges }: BadgeGridProps) {
  const userBadgeIds = new Set(userBadges.map(b => b.id));

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {allBadges.map((badge) => {
        const conquistado = userBadgeIds.has(badge.id);
        const userBadge = userBadges.find(b => b.id === badge.id);
        const Icon = (LucideIcons as any)[badge.icone] || LucideIcons.Award;

        return (
          <TooltipProvider key={badge.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  className={cn(
                    "cursor-pointer transition-all hover:scale-105",
                    conquistado ? "bg-gradient-to-br shadow-lg" : "opacity-50 grayscale"
                  )}
                  style={{
                    backgroundImage: conquistado
                      ? `linear-gradient(135deg, ${badge.cor}15, ${badge.cor}05)`
                      : undefined,
                  }}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div
                      className="p-3 rounded-full"
                      style={{
                        backgroundColor: conquistado ? `${badge.cor}20` : undefined,
                      }}
                    >
                      <Icon
                        className="h-8 w-8"
                        style={{ color: conquistado ? badge.cor : undefined }}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{badge.nome}</p>
                      {conquistado && userBadge && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(userBadge.conquistado_em), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-semibold">{badge.nome}</p>
                  <p className="text-sm">{badge.descricao}</p>
                  {badge.pontos_bonus > 0 && (
                    <p className="text-xs text-accent">+{badge.pontos_bonus} pontos bônus</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}
