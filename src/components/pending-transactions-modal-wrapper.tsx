"use client";

import { useEffect, useState } from "react";
import { PendingTransactionsModal } from "./pending-transactions-modal";
import { useQueryClient } from "@tanstack/react-query";

const STORAGE_KEY = "balancefy_pending_modal_shown";

export function PendingTransactionsModalWrapper() {
  const [open, setOpen] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkPendingTransactions = async () => {
      if (hasChecked) return;
      
      try {
        const res = await fetch("/api/transactions/pending");
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            const today = new Date().toDateString();
            const wasShownToday = sessionStorage.getItem(STORAGE_KEY) === today;
            
            if (!wasShownToday) {
              setOpen(true);
              sessionStorage.setItem(STORAGE_KEY, today);
            }
          }
        }
      } catch {
        // Silently fail
      } finally {
        setHasChecked(true);
      }
    };

    checkPendingTransactions();
  }, [hasChecked]);

  const handleMarkAsPaid = () => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  return (
    <PendingTransactionsModal
      open={open}
      onOpenChange={setOpen}
      onMarkAsPaid={handleMarkAsPaid}
    />
  );
}
