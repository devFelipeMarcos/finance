"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { CalendarDays, Wallet, Tag, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

import { Controller, useForm } from "react-hook-form";
import { useTransactions } from "@/hooks/use-transactions";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  transactionSchema,
  TransactionFormData,
} from "@/lib/schemas/transaction-schema";
import { toast } from "sonner";
import { SelectWallet } from "./select-wallet";
import { SelectCategory } from "./select-category";
import { DateDialog } from "./date-dialog";
import { formatCurrencyBRLInput, parseCurrencyBRL, formatCurrencyBRL } from "@/utils/currency-input";
import { RecurringSelect } from "./recurring-select";
import { cn } from "@/lib/utils";

type CategoryWithEmoji = {
  id: string;
  name: string;
  emoji?: string | null;
  color: string;
};

export function TransactionDialog() {
  const { createTransaction } = useTransactions();
  const [categories, setCategories] = React.useState<CategoryWithEmoji[]>([]);
  const [wallets, setWallets] = React.useState<{ id: string; name: string }[]>([]);

  React.useEffect(() => {
    fetch("/api/categories?type=select")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  React.useEffect(() => {
    fetch("/api/wallets?type=select")
      .then((res) => res.json())
      .then(setWallets);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
      value: 0,
      categoryId: "",
      walletId: "",
      type: "income",
      date: new Date(),
      isRecurring: false,
      recurringUntil: undefined,
    },
  });

  const [valueDisplay, setValueDisplay] = React.useState(formatCurrencyBRL(0));
  const isRecurring = watch("isRecurring");
  const type = watch("type");
  const categoryId = watch("categoryId");

  const selectedCategory = categories.find(c => c.id === categoryId);
  const selectedEmoji = selectedCategory?.emoji || "📁";
  const selectedColor = selectedCategory?.color || "#6366f1";

  function handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCurrencyBRLInput(e.target.value);
    setValueDisplay(formatted);
    const amount = parseCurrencyBRL(formatted);
    setValue("value", amount, { shouldValidate: true });
  }

  function onSubmit(formData: TransactionFormData) {
    const dataToSubmit = {
      ...formData,
      date: new Date(formData.date),
      recurringUntil: formData.recurringUntil ? new Date(formData.recurringUntil) : null,
    };
    
    const parsed = transactionSchema.safeParse(dataToSubmit);
    if (!parsed.success) {
      toast.error("Verifique os campos obrigatórios");
      return;
    }

    createTransaction.mutate(
      {
        description: parsed.data.description,
        value: Number(parsed.data.value),
        type: parsed.data.type,
        date: parsed.data.date,
        categoryId: parsed.data.categoryId,
        walletId: parsed.data.walletId,
        isRecurring: parsed.data.isRecurring,
        recurringUntil: parsed.data.recurringUntil,
      },
      {
        onSuccess: () => {
          toast.success(
            formData.isRecurring
              ? "Transações recorrentes criadas"
              : "Transação criada"
          );
          setValueDisplay(formatCurrencyBRL(0));
          reset();
        },
        onError: () => {
          toast.error("Erro ao criar transação");
        },
      }
    );
  }

  return (
    <Dialog>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTrigger asChild>
          <Button className="bg-[#00FF7F] hover:bg-[#00FF7F]/90 text-black font-semibold cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
            <DialogDescription>
              Adicione uma nova transação ao seu controle financeiro.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#00FF7F]/10 to-transparent border border-[#00FF7F]/20">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: `${selectedColor}20` }}
              >
                {selectedEmoji}
              </div>
              <div className="flex-1 space-y-1">
                <Input
                  placeholder="Descrição da transação"
                  {...register("description")}
                  className="font-medium text-base cursor-pointer"
                />
                {errors.description && (
                  <p className="text-destructive text-xs">{errors.description.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Valor</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                  inputMode="numeric"
                  value={valueDisplay}
                  onChange={handleValueChange}
                  className="pl-10 text-lg font-semibold cursor-pointer"
                  placeholder="0,00"
                />
              </div>
              {errors.value && (
                <p className="text-destructive text-xs">{errors.value.message}</p>
              )}
            </div>

            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => field.onChange("income")}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer",
                        field.value === "income"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                          : "border-border hover:border-emerald-500/50"
                      )}
                    >
                      <ArrowUpCircle className="h-5 w-5" />
                      <span className="font-medium text-xs sm:text-sm">Entrada</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange("expense")}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer",
                        field.value === "expense"
                          ? "border-red-500 bg-red-500/10 text-red-400"
                          : "border-border hover:border-red-500/50"
                      )}
                    >
                      <ArrowDownCircle className="h-5 w-5" />
                      <span className="font-medium text-xs sm:text-sm">Saída</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange("to_receive")}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer",
                        field.value === "to_receive"
                          ? "border-blue-500 bg-blue-500/10 text-blue-400"
                          : "border-border hover:border-blue-500/50"
                      )}
                    >
                      <ArrowUpCircle className="h-5 w-5" />
                      <span className="font-medium text-xs sm:text-sm">A Receber</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange("to_pay")}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer",
                        field.value === "to_pay"
                          ? "border-orange-500 bg-orange-500/10 text-orange-400"
                          : "border-border hover:border-orange-500/50"
                      )}
                    >
                      <ArrowDownCircle className="h-5 w-5" />
                      <span className="font-medium text-xs sm:text-sm">A Pagar</span>
                    </button>
                  </div>
                </div>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Wallet className="h-3 w-3" /> Carteira
                </Label>
                <Controller
                  name="walletId"
                  control={control}
                  render={({ field }) => (
                    <SelectWallet
                      value={field.value}
                      onValueChange={field.onChange}
                      wallets={wallets}
                    />
                  )}
                />
                {errors.walletId && (
                  <p className="text-destructive text-xs">{errors.walletId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Categoria
                </Label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <SelectCategory
                      value={field.value}
                      onValueChange={field.onChange}
                      categories={categories.map(c => ({ id: c.id, name: c.name }))}
                    />
                  )}
                />
                {errors.categoryId && (
                  <p className="text-destructive text-xs">{errors.categoryId.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <CalendarDays className="h-3 w-3" /> Data
              </Label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DateDialog value={field.value} onChange={field.onChange} />
                )}
              />
              {errors.date && (
                <p className="text-destructive text-xs">{errors.date.message}</p>
              )}
            </div>

            <Controller
              name="isRecurring"
              control={control}
              render={({ field }) => (
                <RecurringSelect
                  isRecurring={field.value}
                  onIsRecurringChange={field.onChange}
                  recurringUntil={watch("recurringUntil") ?? null}
                  onRecurringUntilChange={(date) => setValue("recurringUntil", date)}
                  selectedDay={getValues("date") instanceof Date ? getValues("date").getDate() : undefined}
                />
              )}
            />
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" type="button" className="cursor-pointer">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className={cn(
                "font-semibold cursor-pointer",
                type === "income" || type === "to_receive"
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                  : "bg-red-500 hover:bg-red-600 text-white"
              )}
            >
              {isRecurring ? "Criar recorrências" : "Salvar transação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
