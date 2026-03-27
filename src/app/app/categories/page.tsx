import { CategoriesDataTable } from "./components/categories-table";

export const metadata = {
  title: "Categorias | Balancefy",
  description:
    "Organize suas transações por categoria e tenha uma visão clara de onde seu dinheiro está sendo gasto ou ganho.",
};

export default function CategoriesPage() {
  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categorias</h1>
          <p className="text-muted-foreground text-sm">
            Organize suas transações por categoria
          </p>
        </div>
      </div>
      <CategoriesDataTable />
    </div>
  );
}
