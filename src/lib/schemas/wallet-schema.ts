import { z } from "zod";
const walletBase = z.object({
  name: z
    .string()
    .trim()
    .min(3, "O nome da carteira deve ter pelo menos 3 caracteres")
    .max(100, "O nome da carteira pode ter no máximo 100 caracteres"),
});

export const walletSchema = z.union([
  walletBase.extend({
    type: z.literal("wallet").optional(),
  }),
  walletBase.extend({
    type: z.literal("credit_card"),
    brand: z.enum(["visa", "mastercard", "amex", "elo", "hipercard", "diners", "discover"]),
    color: z
      .string()
      .trim()
      .min(1, "Escolha uma cor"),
    limit: z
      .number("Informe um limite válido")
      .positive("O limite deve ser maior que zero"),
    billingDay: z
      .number("Informe um dia de vencimento válido")
      .int("Informe um dia inteiro")
      .min(1, "Dia deve ser entre 1 e 31")
      .max(31, "Dia deve ser entre 1 e 31"),
  }),
]);

export type WalletsFormData = z.infer<typeof walletSchema>;
