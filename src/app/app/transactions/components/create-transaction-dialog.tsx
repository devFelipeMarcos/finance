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

import { Controller, useForm } from "react-hook-form";
import { useTransactions } from "@/hooks/use-transactions";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  transactionSchema,
  TransactionFormData,
} from "@/lib/schemas/transaction-schema";
import { toast } from "sonner";
import { SelectCategory } from "./select-category";
import { SelectWallet } from "./select-wallet";
import { DateDialog } from "./date-dialog";
import { RadioGroupSelect } from "./radio-group-select";
import { formatCurrencyBRLInput, parseCurrencyBRL, formatCurrencyBRL } from "@/utils/currency-input";
import { RecurringSelect } from "./recurring-select";

export function TransactionDialog() {
  const { createTransaction } = useTransactions();
  const [categories, setCategories] = React.useState<
    { id: string; name: string }[]
  >([]);

  const [wallets, setWallets] = React.useState<{ id: string; name: string }[]>(
    []
  );

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
          <Button>
            <Plus /> <p className="hidden md:block ">Nova Transação</p>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Transação</DialogTitle>
            <DialogDescription>
              Preencha todo o formulário com informações da transação.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="description">Descrição</Label>
              <Input id="description" {...register("description")} />
              {errors.description && (
                <span className="text-destructive text-sm">
                  {errors.description.message}
                </span>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="valor">Valor</Label>
              <Input id="valor" inputMode="numeric" value={valueDisplay} onChange={handleValueChange} />
              {errors.value && (
                <span className="text-destructive text-sm">
                  {errors.value.message}
                </span>
              )}
            </div>
            <div className="flex gap-4 flex-col sm:flex-row">
              <div className="flex flex-col gap-2">
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
                  <span className="text-destructive text-sm">
                    {errors.walletId.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <SelectCategory
                      value={field.value}
                      onValueChange={field.onChange}
                      categories={categories}
                    />
                  )}
                />
                {errors.categoryId && (
                  <span className="text-destructive text-sm">
                    {errors.categoryId.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-4 flex-col sm:flex-row ">
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DateDialog value={field.value} onChange={field.onChange} />
                )}
              />
              {errors.date && (
                <span className="text-destructive text-sm">
                  {errors.date.message}
                </span>
              )}
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <RadioGroupSelect
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
              {errors.type && (
                <span className="text-destructive text-sm">
                  {errors.type.message}
                </span>
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
            {errors.recurringUntil && (
              <span className="text-destructive text-sm">
                {errors.recurringUntil.message}
              </span>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isRecurring ? "Criar recorrências" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
