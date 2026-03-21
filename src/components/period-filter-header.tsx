"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePeriod } from "@/context/period-context";
import { Button } from "@/components/ui/button";
import { CalendarIcon, RotateCw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PeriodFilterHeaderProps {
  title: string;
}

export function PeriodFilterHeader({ title }: PeriodFilterHeaderProps) {
  const {
    mode,
    setMode,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    showRecurringOnly,
    setShowRecurringOnly,
  } = usePeriod();

  const handleModeChange = (val: string) => {
    setMode(val as "month" | "total" | "custom");
    if (val !== "custom") {
      setStartDate(undefined);
      setEndDate(undefined);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex flex-wrap items-center gap-3">
        <Select value={mode} onValueChange={handleModeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Mês atual</SelectItem>
            <SelectItem value="total">Período total</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>

        {mode === "custom" && (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[160px] justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, "dd/MM/yyyy")
                  ) : (
                    <span>Data inicial</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => setStartDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <span className="text-muted-foreground">até</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[160px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? (
                    format(endDate, "dd/MM/yyyy")
                  ) : (
                    <span>Data final</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => setEndDate(date)}
                  disabled={(date) => startDate ? date < startDate : false}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={showRecurringOnly ? "default" : "outline"}
              className={cn(showRecurringOnly && "bg-[#00FF7F] text-black hover:bg-[#00FF7F]/90")}
            >
              <RotateCw className="mr-2 h-4 w-4" />
              Fixas
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-4" align="end">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Despesas fixas</p>
                <p className="text-xs text-muted-foreground">
                  Mostrar apenas recorrentes
                </p>
              </div>
              <Button
                variant={showRecurringOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowRecurringOnly(!showRecurringOnly)}
                className={cn(showRecurringOnly && "bg-[#00FF7F] text-black hover:bg-[#00FF7F]/90")}
              >
                {showRecurringOnly ? "Sim" : "Não"}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
