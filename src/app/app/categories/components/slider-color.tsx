"use client";

import { cn } from "@/lib/utils";

const colors = [
  "#ef4444", // Vermelho
  "#f97316", // Laranja
  "#eab308", // Amarelo
  "#22c55e", // Verde
  "#14b8a6", // Teal
  "#06b6d4", // Ciano
  "#3b82f6", // Azul
  "#8b5cf6", // Violeta
  "#ec4899", // Rosa
  "#6b7280", // Cinza
  "#000000", // Preto
  "#ffffff", // Branco
];

export function ColorPicker({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (color: string) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-2 p-1">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onValueChange(color)}
          className={cn(
            "w-8 h-8 rounded-lg border-2 transition-all hover:scale-110",
            value === color
              ? "border-foreground scale-110 shadow-md"
              : "border-transparent hover:border-muted-foreground/30"
          )}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
