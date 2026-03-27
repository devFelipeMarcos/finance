"use client";

import { useEffect, useState } from "react";
import { Transaction } from "@/types/transaction";
import { formatCurrency } from "@/utils/format-currency";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PendingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPendingTransactions();
  }, []);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pendências</h1>
          <p className="text-muted-foreground">
            Gerencie suas contas a pagar
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPendingTransactions}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 rounded-xl border bg-card">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
          <h2 className="text-xl font-semibold mb-2">Tudo em dia!</h2>
          <p className="text-muted-foreground">
            Você não tem pendências no momento.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {overdueTransactions.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-red-500">
                <X className="h-5 w-5" />
                Vencidas ({overdueTransactions.length})
              </h2>
              <div className="space-y-2">
                {overdueTransactions.map((t) => (
                  <PendingCard
                    key={t.id}
                    transaction={t}
                    isProcessing={processingIds.has(t.id)}
                    onMarkAsPaid={() => markAsPaid(t.id)}
                    isOverdue
                  />
                ))}
              </div>
            </div>
          )}

          {todayTransactions.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-amber-500">
                <AlertCircle className="h-5 w-5" />
                Vencem hoje ({todayTransactions.length})
              </h2>
              <div className="space-y-2">
                {todayTransactions.map((t) => (
                  <PendingCard
                    key={t.id}
                    transaction={t}
                    isProcessing={processingIds.has(t.id)}
                    onMarkAsPaid={() => markAsPaid(t.id)}
                    isOverdue={false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface PendingCardProps {
  transaction: Transaction;
  isProcessing: boolean;
  onMarkAsPaid: () => void;
  isOverdue: boolean;
}

function PendingCard({
  transaction,
  isProcessing,
  onMarkAsPaid,
  isOverdue,
}: PendingCardProps) {
  const formattedDate = new Date(transaction.date).toLocaleDateString(
    "pt-BR",
    { day: "2-digit", month: "long", year: "numeric" }
  );

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-xl border bg-card border-t-2",
        isOverdue ? "border-t-red-500" : "border-t-[#00FF7F]"
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center border"
          style={{
            borderColor: transaction.category?.color || "#00FF7F",
            backgroundColor: (transaction.category?.color || "#00FF7F") + "15",
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: transaction.category?.color || "#00FF7F" }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{transaction.description}</span>
            {isOverdue && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 font-medium border border-red-500/30">
                Vencida
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{transaction.category?.name}</span>
            <span>•</span>
            <span>{transaction.wallet?.name}</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-bold text-lg">{formatCurrency(transaction.value)}</p>
        </div>
        <Button
          size="sm"
          onClick={onMarkAsPaid}
          disabled={isProcessing}
          className="bg-[#00FF7F] hover:bg-[#00FF7F]/90 text-black font-medium"
        >
          {isProcessing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Pagar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
