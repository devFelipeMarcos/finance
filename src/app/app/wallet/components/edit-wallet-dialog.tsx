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
import { useWalllets } from "@/hooks/use-wallets";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { WalletsFormData, walletSchema } from "@/lib/schemas/wallet-schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type EditWalletsDialog = {
  wallets: {
    id: string;
    name: string;
    type?: "wallet" | "credit_card";
    brand?: "visa" | "mastercard" | "amex" | "elo" | "hipercard" | "diners" | "discover";
    color?: string;
    limit?: number;
    billingDay?: number | null;
  };
};

export function EditWalletDialog({ wallets }: EditWalletsDialog) {
  const { updateWallets } = useWalllets();
  const [open, setOpen] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WalletsFormData>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      name: wallets.name,
      type: (wallets.type ?? "wallet") as any,
      brand: wallets.brand,
      color: wallets.color,
      limit: wallets.limit,
      billingDay: wallets.billingDay ?? undefined,
    },
  });
  const [limitDisplay, setLimitDisplay] = React.useState(
    (wallets.limit ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  );
  const presetColors = ["#6b21a8", "#2563eb", "#16a34a", "#ef4444", "#f59e0b", "#0ea5e9", "#4b5563"];
  const selectedColor = watch("color" as any) as string | undefined;

  function formatCurrencyBRLInput(raw: string) {
    const onlyDigits = raw.replace(/\D/g, "");
    const number = Number(onlyDigits || "0") / 100;
    return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function handleLimitChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCurrencyBRLInput(e.target.value);
    setLimitDisplay(formatted);
    const digits = e.target.value.replace(/\D/g, "");
    const amount = Number(digits || "0") / 100;
    setValue("limit" as any, amount, { shouldValidate: true });
  }

  function onSubmit(formData: WalletsFormData) {
    const payload =
      (formData as any).type === "credit_card"
        ? {
            id: wallets.id,
            name: formData.name,
            type: "credit_card" as const,
            brand: (formData as any).brand,
            color: (formData as any).color,
            limit: (formData as any).limit,
            billingDay: (formData as any).billingDay,
          }
        : {
            id: wallets.id,
            name: formData.name,
            type: "wallet" as const,
          };

    updateWallets.mutate(payload as any, {
      onSuccess: () => {
        toast.success("Carteira atualizada");
        setOpen(false);
      },
      onError: () => {
        toast.error("Erro ao atualizar carteira");
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTrigger asChild>
          <Button variant="outline">Editar</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Carteira</DialogTitle>
            <DialogDescription>
              Preencha todo o formulário com novas informações da carteira.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Label>Tipo</Label>
            <RadioGroup
              value={watch("type" as any) as any}
              onValueChange={(v) => setValue("type" as any, v as any)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wallet" id="type-wallet-edit" />
                <Label htmlFor="type-wallet-edit">Carteira</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="credit_card" id="type-card-edit" />
                <Label htmlFor="type-card-edit">Cartão de Crédito</Label>
              </div>
            </RadioGroup>
            <Label htmlFor="description">Nome da carteira</Label>
            <Input id="name" {...register("name")} disabled={isSubmitting} />
            {errors && (errors as any).name && (
              <span className="text-destructive text-sm">
                {(errors as any).name.message}
              </span>
            )}
            {watch("type" as any) === "credit_card" && (
              <>
            <div className="grid gap-2">
              <Label>Marca do cartão</Label>
              <Select onValueChange={(v) => setValue("brand" as any, v)}>
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
              {(errors as any)?.brand && (
                <span className="text-destructive text-sm">
                  {(errors as any).brand.message}
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
                    onClick={() => setValue("color" as any, c, { shouldValidate: true })}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setValue("color" as any, c, { shouldValidate: true })}
                  />
                ))}
                <Input
                  type="color"
                  className="w-10 h-10 p-1 rounded-md"
                  defaultValue={wallets.color}
                  onChange={(e) => setValue("color" as any, e.target.value, { shouldValidate: true })}
                />
              </div>
              {(errors as any)?.color && (
                <span className="text-destructive text-sm">
                  {(errors as any).color.message}
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
              {(errors as any)?.limit && (
                <span className="text-destructive text-sm">
                  {(errors as any).limit.message}
                </span>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Dia de vencimento</Label>
              <Input type="number" {...register("billingDay", { valueAsNumber: true })} />
              {(errors as any)?.billingDay && (
                <span className="text-destructive text-sm">
                  {(errors as any).billingDay.message}
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
