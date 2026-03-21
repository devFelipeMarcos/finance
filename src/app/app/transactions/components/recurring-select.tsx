"use client";

import { CalendarIcon, RepeatIcon } from "lucide-react";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface RecurringSelectProps {
  isRecurring: boolean;
  onIsRecurringChange: (value: boolean) => void;
  recurringUntil: Date | null;
  onRecurringUntilChange: (value: Date | null) => void;
  selectedDay?: number;
}

export function RecurringSelect({
  isRecurring,
  onIsRecurringChange,
  recurringUntil,
  onRecurringUntilChange,
  selectedDay,
}: RecurringSelectProps) {
  const [open, setOpen] = useState(false);

  const handleIsRecurringChange = (checked: boolean) => {
    onIsRecurringChange(checked);
    if (checked && !recurringUntil) {
      onRecurringUntilChange(addMonths(new Date(), 6));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <RepeatIcon className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="recurring" className="cursor-pointer">
            Cobrança recorrente
          </Label>
        </div>
        <Switch
          id="recurring"
          checked={isRecurring}
          onCheckedChange={handleIsRecurringChange}
        />
      </div>

      {isRecurring && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <Label className="text-sm text-muted-foreground mb-2 block">
            Repetir até
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !recurringUntil && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {recurringUntil ? (
                  format(recurringUntil, "MMMM 'de' yyyy", { locale: ptBR })
                ) : (
                  <span>Selecione a data final</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={recurringUntil ?? undefined}
                onSelect={(date) => {
                  onRecurringUntilChange(date ?? null);
                  if (date) setOpen(false);
                }}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground mt-2">
            A transação será criada automaticamente todo dia {selectedDay || "da data selecionada"} de cada mês
          </p>
        </div>
      )}
    </div>
  );
}
