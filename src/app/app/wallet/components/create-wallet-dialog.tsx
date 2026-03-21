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
import { Plus, CreditCard, Wallet as WalletIcon, Calendar } from "lucide-react";
import { WalletsFormData, walletSchema } from "@/lib/schemas/wallet-schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useWalllets } from "@/hooks/use-wallets";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrencyBRLInput, parseCurrencyBRL, formatCurrencyBRL } from "@/utils/currency-input";
import { cn } from "@/lib/utils";

const brandLogos: Record<string, string> = {
  visa: "VISA",
  mastercard: "MC",
  amex: "AMEX",
  elo: "ELO",
  hipercard: "HIPER",
  diners: "DINERS",
  discover: "DISC",
};

const presetColors = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#06b6d4", "#3b82f6", "#1e293b", "#0f172a",
];

function CreditCardPreview({ color, brand, name, billingDay }: { color: string; brand: string; name: string; billingDay: number | null }) {
  return (
    <div
      className="relative w-full rounded-xl p-4 text-white overflow-hidden min-h-[140px] flex flex-col justify-between"
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
      }}
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 opacity-90" />
          <span className="text-xs opacity-90">{name || "Nome do cartão"}</span>
        </div>
        <div className="text-xs opacity-75 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{billingDay ? `Dia ${billingDay}` : "—"}</span>
        </div>
      </div>

      <div className="relative z-10">
        <p className="font-mono text-sm tracking-widest opacity-90 mb-2">
          •••• •••• •••• ••••
        </p>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] opacity-75">Bandeira</p>
            <p className="font-bold text-sm uppercase">{brandLogos[brand] || brand || "—"}</p>
          </div>
          <div className={cn("font-bold text-lg tracking-wider", brand === "amex" ? "text-yellow-300" : "text-white")}>
            {brandLogos[brand] || "CARD"}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  
  React.useEffect(() => {
    if (!open) {
      setLimitDisplay(formatCurrencyBRL(0));
      reset();
    }
  }, [open, reset]);

  const selectedType = watch("type");
  const selectedColor = watch("color");
  const selectedBrand = watch("brand");
  const selectedBillingDay = watch("billingDay");
  const cardName = watch("name");

  function handleLimitChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCurrencyBRLInput(e.target.value);
    setLimitDisplay(formatted);
    const amount = parseCurrencyBRL(formatted);
    setValue("limit", amount, { shouldValidate: true });
  }

  function onSubmit(formData: WalletsFormData) {
    createWallets.mutate(formData, {
      onSuccess: () => {
        toast.success("Carteira criada");
        setOpen(false);
        setLimitDisplay(formatCurrencyBRL(0));
        reset();
      },
      onError: () => {
        toast.error("Erro ao criar carteira");
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Nova Carteira
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Adicionar Carteira</DialogTitle>
            <DialogDescription>
              Crie uma nova carteira ou cartão de crédito.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder={selectedType === "credit_card" ? "Ex: Nubank, Inter..." : "Ex: Carteira Principal..."}
                {...register("name")}
              />
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
                  <RadioGroupItem value="wallet" id="type-wallet" className="sr-only" />
                  <Label htmlFor="type-wallet" className="cursor-pointer flex items-center gap-2 font-medium">
                    <WalletIcon className="w-4 h-4" />
                    Carteira
                  </Label>
                </div>
                <div className={cn(
                  "flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                  selectedType === "credit_card"
                    ? "border-[#00FF7F] bg-[#00FF7F]/10"
                    : "border-border hover:border-muted-foreground/50"
                )}>
                  <RadioGroupItem value="credit_card" id="type-card" className="sr-only" />
                  <Label htmlFor="type-card" className="cursor-pointer flex items-center gap-2 font-medium">
                    <CreditCard className="w-4 h-4" />
                    Cartão
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {selectedType === "credit_card" && (
              <>
                <div className="space-y-2">
                  <Label>Preview do cartão</Label>
                  <CreditCardPreview
                    color={selectedColor ?? "#6366f1"}
                    brand={selectedBrand ?? ""}
                    name={cardName ?? ""}
                    billingDay={selectedBillingDay ?? null}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
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

                  <div className="space-y-2">
                    <Label>Dia de vencimento</Label>
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      placeholder="Ex: 15"
                      {...register("billingDay", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Limite do cartão</Label>
                  <Input
                    type="text"
                    value={limitDisplay}
                    onChange={handleLimitChange}
                    placeholder="R$ 0,00"
                  />
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
              Criar Carteira
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
