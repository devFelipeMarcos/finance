import { z } from "zod";
export const categoriesSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "O nome da categoria deve ter pelo menos 3 caracteres")
    .max(100, "O nome da categoria pode ter no máximo 100 caracteres"),
  emoji: z.string().optional().nullable(),
  color: z.string().min(1, "Escolha uma cor para a categoria"),
});
export type CategoriesFormData = z.infer<typeof categoriesSchema>;
