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
import { WalletsFormData, walletSchema } from "@/lib/schemas/wallet-schema";
import { useForm } from "react-hook-form";
import type { Path, PathValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useWalllets } from "@/hooks/use-wallets";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrencyBRLInput, parseCurrencyBRL, formatCurrencyBRL } from "@/utils/currency-input";

export function WalletDialog() {
  const { createWallets } = useWalllets();
  const [open, setOpen] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WalletsFormData>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      name: "",
      type: "wallet",
    },
  });
  const [limitDisplay, setLimitDisplay] = React.useState(formatCurrencyBRL(0));
  const presetColors = ["#6b21a8", "#2563eb", "#16a34a", "#ef4444", "#f59e0b", "#0ea5e9", "#4b5563"];
  const selectedColor = watch("color") as unknown as string | undefined;

  function handleLimitChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCurrencyBRLInput(e.target.value);
    setLimitDisplay(formatted);
    const amount = parseCurrencyBRL(formatted);
    setValue("limit", amount, { shouldValidate: true });
  }

  function onSubmit(formData: WalletsFormData) {
    createWallets.mutate(formData, {
      onSuccess: () => {
        toast.success("Cartaira criada");
        setOpen(false);
        reset();
      },
      onError: () => {
        toast.error("Erro ao criar carteira");
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTrigger asChild>
          <Button>
            <Plus /> Nova Carteira
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Carteira</DialogTitle>
            <DialogDescription>
              Preencha todo o formulário com informações da carteira.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Label>Tipo</Label>
            <RadioGroup
              value={(watch("type") as unknown as string) ?? "wallet"}
              onValueChange={(v) => setValue("type", v as unknown as WalletsFormData["type"])}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wallet" id="type-wallet" />
                <Label htmlFor="type-wallet">Carteira</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="credit_card" id="type-card" />
                <Label htmlFor="type-card">Cartão de Crédito</Label>
              </div>
            </RadioGroup>
            <Label htmlFor="description">Nome</Label>
            <Input id="name" {...register("name")} disabled={isSubmitting} />
            {errors && (errors as Record<string, { message?: string }>).name && (
              <span className="text-destructive text-sm">
                {(errors as Record<string, { message?: string }>).name?.message}
              </span>
            )}
            {(watch("type") as unknown as string) === "credit_card" && (
              <>
            <div className="grid gap-2">
              <Label>Marca do cartão</Label>
              <Select
                onValueChange={(v) =>
                  setValue(
                    "brand" as unknown as Path<WalletsFormData>,
                    v as unknown as PathValue<WalletsFormData, Path<WalletsFormData>>
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a bandeira" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visa">Visa</SelectItem>
                  <SelectItem value="mastercard">Mastercard</SelectItem>
                  <SelectItem value="amex">Amex</SelectItem>
                  <SelectItem value="elo">Elo</SelectItem>
                  <SelectItem value="hipercard">Hipercard</SelectItem>
                  <SelectItem value="diners">Diners</SelectItem>
                  <SelectItem value="discover">Discover</SelectItem>
                </SelectContent>
              </Select>
              {(errors as Record<string, { message?: string }>)?.brand && (
                <span className="text-destructive text-sm">
                  {(errors as Record<string, { message?: string }>).brand?.message}
                </span>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Cor do cartão</Label>
              <div className="flex flex-wrap gap-2">
                {presetColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="button"
                    tabIndex={0}
                    aria-label={`Selecionar cor ${c}`}
                    className={`w-8 h-8 rounded-full border cursor-pointer ${selectedColor === c ? "ring-2 ring-white" : ""}`}
                    style={{ background: c }}
                    onClick={() => setValue("color", c, { shouldValidate: true })}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setValue("color", c, { shouldValidate: true })}
                  />
                ))}
                <Input
                  type="color"
                  className="w-10 h-10 p-1 rounded-md"
                  onChange={(e) => setValue("color", e.target.value, { shouldValidate: true })}
                />
              </div>
              {(errors as Record<string, { message?: string }>)?.color && (
                <span className="text-destructive text-sm">
                  {(errors as Record<string, { message?: string }>).color?.message}
                </span>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Limite</Label>
              <Input
                type="text"
                value={limitDisplay}
                onChange={handleLimitChange}
                placeholder="R$ 0,00"
              />
              {(errors as Record<string, { message?: string }>)?.limit && (
                <span className="text-destructive text-sm">
                  {(errors as Record<string, { message?: string }>).limit?.message}
                </span>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Dia de vencimento</Label>
              <Input type="number" {...register("billingDay", { valueAsNumber: true })} />
              {(errors as Record<string, { message?: string }>)?.billingDay && (
                <span className="text-destructive text-sm">
                  {(errors as Record<string, { message?: string }>).billingDay?.message}
                </span>
              )}
            </div>
              </>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSubmit(onSubmit)} type="submit">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
