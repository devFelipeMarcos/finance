"use client";

import { useState } from "react";
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
import { Pencil } from "lucide-react";
import { useWalllets } from "@/hooks/use-wallets";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { WalletsFormData, walletSchema } from "@/lib/schemas/wallet-schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrencyBRLInput, parseCurrencyBRL, formatCurrencyBRL } from "@/utils/currency-input";
import { cn } from "@/lib/utils";

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

const presetColors = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#06b6d4", "#3b82f6", "#1e293b", "#0f172a",
];

export function EditWalletDialog({ wallets }: EditWalletsDialog) {
  const { updateWallets } = useWalllets();
  const [open, setOpen] = useState(false);

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
      type: wallets.type ?? "wallet",
      brand: wallets.brand,
      color: wallets.color,
      limit: wallets.limit,
      billingDay: wallets.billingDay ?? undefined,
    },
  });

  const [limitDisplay, setLimitDisplay] = useState(formatCurrencyBRL(wallets.limit ?? 0));
  const selectedColor = watch("color");
  const selectedType = watch("type");

  function handleLimitChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCurrencyBRLInput(e.target.value);
    setLimitDisplay(formatted);
    const amount = parseCurrencyBRL(formatted);
    setValue("limit", amount, { shouldValidate: true });
  }

  function onSubmit(formData: WalletsFormData) {
    const payload =
      ("type" in formData && formData.type === "credit_card")
        ? {
            id: wallets.id,
            name: formData.name,
            type: "credit_card" as const,
            brand: (formData as Extract<WalletsFormData, { type: "credit_card" }>).brand,
            color: (formData as Extract<WalletsFormData, { type: "credit_card" }>).color,
            limit: (formData as Extract<WalletsFormData, { type: "credit_card" }>).limit,
            billingDay: (formData as Extract<WalletsFormData, { type: "credit_card" }>).billingDay,
          }
        : {
            id: wallets.id,
            name: formData.name,
            type: "wallet" as const,
          };

    updateWallets.mutate(payload, {
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
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Editar Carteira</DialogTitle>
            <DialogDescription>
              Atualize as informações da sua carteira.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input id="edit-name" {...register("name")} />
              {errors.name && (
                <span className="text-destructive text-sm">{errors.name.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <RadioGroup
                value={selectedType ?? "wallet"}
                onValueChange={(v) => setValue("type", v as unknown as WalletsFormData["type"])}
                className="grid grid-cols-2 gap-3"
              >
                <div className={cn(
                  "flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                  selectedType === "wallet"
                    ? "border-[#00FF7F] bg-[#00FF7F]/10"
                    : "border-border hover:border-muted-foreground/50"
                )}>
                  <RadioGroupItem value="wallet" id="type-wallet-edit" className="sr-only" />
                  <Label htmlFor="type-wallet-edit" className="cursor-pointer font-medium">
                    Carteira
                  </Label>
                </div>
                <div className={cn(
                  "flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                  selectedType === "credit_card"
                    ? "border-[#00FF7F] bg-[#00FF7F]/10"
                    : "border-border hover:border-muted-foreground/50"
                )}>
                  <RadioGroupItem value="credit_card" id="type-card-edit" className="sr-only" />
                  <Label htmlFor="type-card-edit" className="cursor-pointer font-medium">
                    Cartão
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {selectedType === "credit_card" && (
              <>
                <div className="space-y-2">
                  <Label>Bandeira</Label>
                  <Select onValueChange={(v) => setValue("brand" as never, v as never)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
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
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Limite</Label>
                    <Input
                      type="text"
                      value={limitDisplay}
                      onChange={handleLimitChange}
                      placeholder="R$ 0,00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dia vencimento</Label>
                    <Input type="number" min={1} max={31} {...register("billingDay", { valueAsNumber: true })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cor do cartão</Label>
                  <div className="flex flex-wrap gap-2">
                    {presetColors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={cn(
                          "w-8 h-8 rounded-lg transition-all hover:scale-110",
                          selectedColor === c ? "ring-2 ring-white ring-offset-2 scale-110" : ""
                        )}
                        style={{ backgroundColor: c }}
                        onClick={() => setValue("color", c)}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
