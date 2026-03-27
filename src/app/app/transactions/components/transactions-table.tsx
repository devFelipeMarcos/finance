"use client";

import * as React from "react";
import { useTransactions } from "@/hooks/use-transactions";
import { Transaction } from "@/types/transaction";

import {
  ArrowUpDown,
  Search,
  TrendingUp,
  TrendingDown,
  Clock,
  Filter,
  MoreHorizontal,
  Repeat,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransactionDialog } from "./create-transaction-dialog";
import { EditTransactionDialog } from "./edit-transaction-dialog";
import { usePeriod } from "@/context/period-context";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const typeConfig = {
  income: {
    label: "Entrada",
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  to_receive: {
    label: "A Receber",
    icon: Clock,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  expense: {
    label: "Saída",
    icon: TrendingDown,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  to_pay: {
    label: "A Pagar",
    icon: Clock,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
};

function TransactionCard({
  transaction,
  onEdit,
  onDelete,
}: {
  transaction: Transaction;
  onEdit: () => void;
  onDelete: (id: string) => void;
}) {
  const config = typeConfig[transaction.type] || typeConfig.expense;
  const categoryEmoji = transaction.category?.emoji || "📁";

  return (
    <div
      onClick={onEdit}
      className={cn(
        "group relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer",
        "bg-card hover:bg-card/80 hover:shadow-lg hover:shadow-black/20",
        config.border
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl text-lg sm:text-xl flex-shrink-0",
          config.bg
        )}
      >
        {categoryEmoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm sm:text-base truncate">{transaction.description}</h3>
          {transaction.isRecurring && (
            <Repeat className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">
          <span className="truncate max-w-[80px] sm:max-w-none">{transaction.category?.name || "Sem categoria"}</span>
          <span className="hidden sm:inline text-muted-foreground/50">•</span>
          <span className="hidden sm:inline truncate">{transaction.wallet?.name || "Sem carteira"}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <div className="text-right">
          <p
            className={cn(
              "font-semibold text-sm sm:text-lg whitespace-nowrap",
              transaction.type === "income" || transaction.type === "to_receive"
                ? "text-emerald-400"
                : "text-red-400"
            )}
          >
            {transaction.type === "income" || transaction.type === "to_receive"
              ? "+"
              : "-"}
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(parseFloat(transaction.value.toString()))}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {new Date(transaction.date).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
            })}
          </p>
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <EditTransactionDialog transaction={transaction} />
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={() => onDelete(transaction.id)}
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

function TransactionSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-card animate-pulse">
      <div className="h-12 w-12 rounded-xl bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-3 w-48 bg-muted rounded" />
      </div>
      <div className="text-right space-y-2">
        <div className="h-5 w-24 bg-muted rounded" />
        <div className="h-3 w-16 bg-muted rounded" />
      </div>
    </div>
  );
}

export function TransactionsTable() {
  const { mode, startDate, endDate } = usePeriod();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { transactions, deleteTransaction, isLoading } = useTransactions(
    mode === "month" ? { month, year } : undefined
  );

  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  const filteredTransactions = React.useMemo(() => {
    if (!transactions) return [];

    let filtered = transactions;

    if (mode === "custom" && startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter((t) => {
        const date = new Date(t.date);
        return date >= start && date <= end;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter((t) =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [transactions, searchQuery, sortOrder, mode, startDate, endDate]);

  const totals = React.useMemo(() => {
    if (!filteredTransactions) return { income: 0, expense: 0 };

    return filteredTransactions.reduce(
      (acc, t) => {
        if (t.type === "income") {
          acc.income += parseFloat(t.value.toString());
        } else if (t.type === "expense") {
          acc.expense += parseFloat(t.value.toString());
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [filteredTransactions]);

  function handleDelete(id: string) {
    deleteTransaction.mutate(id, {
      onSuccess: () => toast.success("Transação excluída!"),
      onError: () => toast.error("Erro ao excluir transação"),
    });
  }

  const [editTransaction, setEditTransaction] = React.useState<Transaction | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <TransactionSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Entradas</p>
              <p className="text-2xl font-bold text-emerald-400">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totals.income)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Saídas</p>
              <p className="text-2xl font-bold text-red-400">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totals.expense)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Saldo</p>
              <p
                className={cn(
                  "text-2xl font-bold",
                  totals.income - totals.expense >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                )}
              >
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totals.income - totals.expense)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-[#00FF7F]/10 flex items-center justify-center">
              <span className="text-xl font-bold text-[#00FF7F]">R$</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar transações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          className="cursor-pointer"
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          {sortOrder === "desc" ? "Mais recentes" : "Mais antigas"}
        </Button>

        <TransactionDialog />
      </div>

      <div className="space-y-2">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onEdit={() => setEditTransaction(transaction)}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Nenhuma transação encontrada</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery
                ? "Tente buscar por outro termo"
                : "Adicione sua primeira transação"}
            </p>
          </div>
        )}
      </div>

      {editTransaction && (
        <EditTransactionDialog
          transaction={editTransaction}
          open={!!editTransaction}
          onOpenChange={(open) => !open && setEditTransaction(null)}
        />
      )}
    </div>
  );
}
