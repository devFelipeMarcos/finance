"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type PeriodMode = "month" | "total" | "custom";

interface PeriodContextProps {
  mode: PeriodMode;
  setMode: (mode: PeriodMode) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  showRecurringOnly: boolean;
  setShowRecurringOnly: (show: boolean) => void;
}

const PeriodContext = createContext<PeriodContextProps | undefined>(undefined);

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PeriodMode>("month");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showRecurringOnly, setShowRecurringOnly] = useState(false);

  return (
    <PeriodContext.Provider
      value={{
        mode,
        setMode,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        showRecurringOnly,
        setShowRecurringOnly,
      }}
    >
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriod() {
  const context = useContext(PeriodContext);
  if (!context) {
    throw new Error("usePeriod deve ser usado dentro de um PeriodProvider");
  }
  return context;
}
