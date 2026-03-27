"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CategoriesFormData,
  categoriesSchema,
} from "@/lib/schemas/categories-schema";
import { useCategories } from "@/hooks/use-categories";
import { usePeriod } from "@/context/period-context";
import { ColorPicker } from "./slider-color";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Category = {
  id: string;
  name: string;
  emoji?: string | null;
  color: string;
  value: number;
  number: number;
  relationship: string[];
};

interface CategoryCardProps {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}

function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div
      className="group relative flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-card/80 hover:shadow-lg hover:shadow-black/20 transition-all duration-200 cursor-pointer"
      onClick={onEdit}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl"
        style={{ backgroundColor: `${category.color}20` }}
      >
        {category.emoji || "📁"}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{category.name}</h3>
        <p className="text-sm text-muted-foreground">
          {category.number} transação{category.number !== 1 ? "ões" : ""}
        </p>
      </div>

      <div className="text-right">
        <p
          className={cn(
            "font-bold text-lg",
            category.value >= 0 ? "text-emerald-400" : "text-red-400"
          )}
        >
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(category.value)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: category.color }}
          />
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-red-400 hover:text-red-500 hover:bg-red-500/10"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface EditCategoryDialogProps {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EditCategoryDialog({
  category,
  open,
  onOpenChange,
}: EditCategoryDialogProps) {
  const { updateCategories } = useCategories();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoriesFormData>({
    resolver: zodResolver(categoriesSchema),
    defaultValues: {
      name: category.name,
      emoji: category.emoji || "",
      color: category.color,
    },
  });

  const selectedEmoji = watch("emoji");

  const commonEmojis = [
    "🍔", "🛒", "🏠", "🚗", "⛽", "🎮", "🎬", "🎵",
    "👕", "💄", "🏥", "💊", "📚", "✈️", "🏨", "🎁",
    "💰", "💳", "🏦", "📱", "💻", "🔌", "📦", "🎯",
    "🏋️", "💪", "🎨", "📸", "🐕", "🌱", "☕", "🍺",
  ];

  function onSubmit(formData: CategoriesFormData) {
    updateCategories.mutate(
      {
        id: category.id,
        name: formData.name,
        emoji: formData.emoji || null,
        color: formData.color,
      },
      {
        onSuccess: () => {
          toast.success("Categoria atualizada");
          onOpenChange(false);
        },
        onError: () => {
          toast.error("Erro ao atualizar categoria");
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
          <DialogDescription>
            Edite as informações da categoria.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-xl text-3xl"
              style={{ backgroundColor: `${watch("color")}20` }}
            >
              {selectedEmoji || "📁"}
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="name">Nome da categoria</Label>
              <Input
                id="name"
                {...register("name")}
                disabled={isSubmitting}
                className="cursor-pointer"
              />
              {errors.name && (
                <span className="text-destructive text-sm">
                  {errors.name.message}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Emoji</Label>
            <Controller
              name="emoji"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Input
                    placeholder="Digite um emoji ou selecione abaixo"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="cursor-pointer"
                  />
                  <div className="grid grid-cols-8 gap-1">
                    {commonEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => field.onChange(emoji)}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all cursor-pointer",
                          field.value === emoji
                            ? "bg-[#00FF7F]/20 ring-2 ring-[#00FF7F]"
                            : "hover:bg-muted"
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            />
          </div>

          <div className="space-y-3">
            <Label>Cor</Label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <ColorPicker
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="p-4 rounded-xl bg-muted/50">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{category.number}</span> transação{category.number !== 1 ? "ões" : ""} •{" "}
              <span className="font-semibold text-foreground">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(category.value)}
              </span>
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#00FF7F] hover:bg-[#00FF7F]/90 text-black cursor-pointer"
            >
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CreateCategoryDialog({ open, onOpenChange }: CreateCategoryDialogProps) {
  const { createCategories } = useCategories();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoriesFormData>({
    resolver: zodResolver(categoriesSchema),
    defaultValues: {
      name: "",
      emoji: "",
      color: "#6366f1",
    },
  });

  const selectedEmoji = watch("emoji");

  const commonEmojis = [
    "🍔", "🛒", "🏠", "🚗", "⛽", "🎮", "🎬", "🎵",
    "👕", "💄", "🏥", "💊", "📚", "✈️", "🏨", "🎁",
    "💰", "💳", "🏦", "📱", "💻", "🔌", "📦", "🎯",
    "🏋️", "💪", "🎨", "📸", "🐕", "🌱", "☕", "🍺",
  ];

  function onSubmit(formData: CategoriesFormData) {
    createCategories.mutate(
      {
        name: formData.name,
        emoji: formData.emoji || null,
        color: formData.color || "#6366f1",
        relationship: [],
        value: 0,
        number: 0,
      },
      {
        onSuccess: () => {
          toast.success("Categoria criada");
          reset();
          onOpenChange(false);
        },
        onError: () => {
          toast.error("Erro ao criar categoria");
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
          <DialogDescription>
            Crie uma nova categoria para organizar suas transações.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-xl text-3xl"
              style={{ backgroundColor: `${watch("color")}20` }}
            >
              {selectedEmoji || "📁"}
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="create-name">Nome da categoria</Label>
              <Input
                id="create-name"
                placeholder="Ex: Alimentação"
                {...register("name")}
                disabled={isSubmitting}
                className="cursor-pointer"
              />
              {errors.name && (
                <span className="text-destructive text-sm">
                  {errors.name.message}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Emoji</Label>
            <Controller
              name="emoji"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Input
                    placeholder="Digite um emoji ou selecione abaixo"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="cursor-pointer"
                  />
                  <div className="grid grid-cols-8 gap-1">
                    {commonEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => field.onChange(emoji)}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all cursor-pointer",
                          field.value === emoji
                            ? "bg-[#00FF7F]/20 ring-2 ring-[#00FF7F]"
                            : "hover:bg-muted"
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            />
          </div>

          <div className="space-y-3">
            <Label>Cor</Label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <ColorPicker
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#00FF7F] hover:bg-[#00FF7F]/90 text-black cursor-pointer"
            >
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCategoryDialog({
  id,
  name,
  open,
  onOpenChange,
}: {
  id: string;
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { deleteCategories } = useCategories();

  function handleDelete() {
    deleteCategories.mutate(id, {
      onSuccess: () => {
        toast.success("Categoria excluída");
        onOpenChange(false);
      },
      onError: () => {
        toast.error("Erro ao excluir categoria");
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Excluir Categoria</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir a categoria &ldquo;{name}&rdquo;? Esta ação não
            pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="cursor-pointer"
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CategorySkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-card animate-pulse">
      <div className="h-14 w-14 rounded-xl bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-5 w-32 bg-muted rounded" />
        <div className="h-4 w-24 bg-muted rounded" />
      </div>
      <div className="text-right space-y-2">
        <div className="h-6 w-20 bg-muted rounded" />
        <div className="h-3 w-3 rounded-full bg-muted" />
      </div>
    </div>
  );
}

export function CategoriesDataTable() {
  const { mode } = usePeriod();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { categories, isLoading } = useCategories(
    mode === "month" ? { month, year } : undefined
  );

  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editCategory, setEditCategory] = React.useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = React.useState<Category | null>(null);

  const filteredCategories = React.useMemo(() => {
    if (!categories) return [];

    let filtered = categories;

    if (searchQuery) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      if (sortOrder === "desc") {
        return b.value - a.value;
      }
      return a.value - b.value;
    });
  }, [categories, searchQuery, sortOrder]);

  const totals = React.useMemo(() => {
    if (!categories) return { total: 0, count: 0 };
    return {
      total: categories.reduce((acc, c) => acc + c.value, 0),
      count: categories.length,
    };
  }, [categories]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <CategorySkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total por categoria</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totals.total)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-[#00FF7F]/10 flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Categorias</p>
              <p className="text-2xl font-bold">{totals.count}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-[#00FF7F]/10 flex items-center justify-center">
              <span className="text-xl">🏷️</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Input
          placeholder="Buscar categorias..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm bg-card cursor-pointer"
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setSortOrder(sortOrder === "desc" ? "asc" : "desc")
          }
          className="cursor-pointer"
        >
          {sortOrder === "desc" ? "Maior valor" : "Menor valor"}
        </Button>

        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="ml-auto bg-[#00FF7F] hover:bg-[#00FF7F]/90 text-black font-semibold cursor-pointer"
        >
          Nova Categoria
        </Button>
      </div>

      <div className="space-y-2">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={() => setEditCategory(category)}
              onDelete={() => setDeleteCategory(category)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="text-3xl">🏷️</span>
            </div>
            <h3 className="text-lg font-medium">Nenhuma categoria encontrada</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery
                ? "Tente buscar por outro termo"
                : "Crie sua primeira categoria"}
            </p>
          </div>
        )}
      </div>

      <CreateCategoryDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {editCategory && (
        <EditCategoryDialog
          category={editCategory}
          open={!!editCategory}
          onOpenChange={(open) => !open && setEditCategory(null)}
        />
      )}

      {deleteCategory && (
        <DeleteCategoryDialog
          id={deleteCategory.id}
          name={deleteCategory.name}
          open={!!deleteCategory}
          onOpenChange={(open) => !open && setDeleteCategory(null)}
        />
      )}
    </div>
  );
}
