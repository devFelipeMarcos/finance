"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/types/transaction";
import { formatCurrency } from "@/utils/format-currency";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PendingTransactionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkAsPaid?: () => void;
}

export function PendingTransactionsModal({
  open,
  onOpenChange,
  onMarkAsPaid,
}: PendingTransactionsModalProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      fetchPendingTransactions();
    }
  }, [open]);

  const fetchPendingTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/transactions/pending");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch {
      toast.error("Erro ao buscar pendências");
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (transactionId: string) => {
    setProcessingIds((prev) => {
      const next = new Set(prev);
      next.add(transactionId);
      return next;
    });
    try {
      const res = await fetch("/api/transactions/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId }),
      });

      if (res.ok) {
        toast.success("Conta marcada como paga!");
        setTransactions((prev) =>
          prev.filter((t) => t.id !== transactionId)
        );
        onMarkAsPaid?.();
      } else {
        const error = await res.json();
        toast.error(error.error || "Erro ao marcar como pago");
      }
    } catch {
      toast.error("Erro ao marcar como pago");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(transactionId);
        return next;
      });
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    const transDate = new Date(date);
    return (
      transDate.getDate() === today.getDate() &&
      transDate.getMonth() === today.getMonth() &&
      transDate.getFullYear() === today.getFullYear()
    );
  };

  const isOverdue = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const transDate = new Date(date);
    transDate.setHours(0, 0, 0, 0);
    return transDate < today;
  };

  const todayTransactions = transactions.filter((t) => isToday(t.date));
  const overdueTransactions = transactions.filter((t) => isOverdue(t.date));

  const hasNoPending = todayTransactions.length === 0 && overdueTransactions.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Pendências encontradas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {hasNoPending && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">Nenhuma pendência!</p>
              <p className="text-sm">Você está em dia com suas contas.</p>
            </div>
          )}
          {overdueTransactions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-red-500 flex items-center gap-2">
                <X className="h-4 w-4" />
                Vencidas
              </h3>
              {overdueTransactions.map((t) => (
                <PendingItem
                  key={t.id}
                  transaction={t}
                  isProcessing={processingIds.has(t.id)}
                  onMarkAsPaid={() => markAsPaid(t.id)}
                  isOverdue
                />
              ))}
            </div>
          )}

          {todayTransactions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-amber-500 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Vencem hoje
              </h3>
              {todayTransactions.map((t) => (
                <PendingItem
                  key={t.id}
                  transaction={t}
                  isProcessing={processingIds.has(t.id)}
                  onMarkAsPaid={() => markAsPaid(t.id)}
                  isOverdue={false}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface PendingItemProps {
  transaction: Transaction;
  isProcessing: boolean;
  onMarkAsPaid: () => void;
  isOverdue: boolean;
}

function PendingItem({
  transaction,
  isProcessing,
  onMarkAsPaid,
  isOverdue,
}: PendingItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border bg-card border-t-2",
        isOverdue ? "border-t-red-500" : "border-t-[#00FF7F]"
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{transaction.description}</span>
          <span
            className="text-xs px-2 py-0.5 rounded-full border"
            style={{
              borderColor: (transaction.category?.color || "#00FF7F") + "50",
              backgroundColor: (transaction.category?.color || "#00FF7F") + "15",
              color: transaction.category?.color || "#00FF7F",
            }}
          >
            {transaction.category?.name}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{transaction.wallet?.name}</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(transaction.value)}
          </span>
        </div>
      </div>
      <Button
        size="sm"
        onClick={onMarkAsPaid}
        disabled={isProcessing}
        className="bg-[#00FF7F] hover:bg-[#00FF7F]/90 text-black font-medium"
      >
        {isProcessing ? (
          <span className="animate-pulse">Processando...</span>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Pagar
          </>
        )}
      </Button>
    </div>
  );
}
