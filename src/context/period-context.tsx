"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

const STORAGE_KEY = "balancefy-period-settings";

const PeriodContext = createContext<PeriodContextProps | undefined>(undefined);

function getStoredSettings() {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        mode: parsed.mode || "month",
        startDate: parsed.startDate ? new Date(parsed.startDate) : undefined,
        endDate: parsed.endDate ? new Date(parsed.endDate) : undefined,
        showRecurringOnly: parsed.showRecurringOnly || false,
      };
    }
  } catch {
    return null;
  }
  return null;
}

function saveSettings(settings: {
  mode: PeriodMode;
  startDate: Date | undefined;
  endDate: Date | undefined;
  showRecurringOnly: boolean;
}) {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      mode: settings.mode,
      startDate: settings.startDate?.toISOString(),
      endDate: settings.endDate?.toISOString(),
      showRecurringOnly: settings.showRecurringOnly,
    }));
  } catch {
    // Ignora erros de localStorage
  }
}

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<PeriodMode>("month");
  const [startDate, setStartDateState] = useState<Date | undefined>(undefined);
  const [endDate, setEndDateState] = useState<Date | undefined>(undefined);
  const [showRecurringOnly, setShowRecurringOnlyState] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = getStoredSettings();
    if (stored) {
      setModeState(stored.mode);
      setStartDateState(stored.startDate);
      setEndDateState(stored.endDate);
      setShowRecurringOnlyState(stored.showRecurringOnly);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      saveSettings({ mode, startDate, endDate, showRecurringOnly });
    }
  }, [mode, startDate, endDate, showRecurringOnly, isHydrated]);

  const setMode = (newMode: PeriodMode) => {
    setModeState(newMode);
    if (newMode !== "custom") {
      setStartDateState(undefined);
      setEndDateState(undefined);
    }
  };

  const setStartDate = (date: Date | undefined) => {
    setStartDateState(date);
  };

  const setEndDate = (date: Date | undefined) => {
    setEndDateState(date);
  };

  const setShowRecurringOnly = (show: boolean) => {
    setShowRecurringOnlyState(show);
  };

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
