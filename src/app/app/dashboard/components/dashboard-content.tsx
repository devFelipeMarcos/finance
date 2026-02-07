 "use client";
 import * as React from "react";
 import Summary from "./summary";
 import { ChartPieDonut } from "./chart-pie-donut";
 import { ChartAreaFinance } from "./chart-area-interactive";
 import { TransactionsTable } from "./transactions-table";
 import { PeriodFilterHeader } from "@/components/period-filter-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
 
 type WalletOption = { id: string; name: string };
 
 export default function DashboardContent() {
   const [wallets, setWallets] = React.useState<WalletOption[]>([]);
  const [walletIds, setWalletIds] = React.useState<string[]>([]);
 
   React.useEffect(() => {
     let active = true;
     fetch("/api/wallets?type=select")
       .then((res) => (res.ok ? res.json() : []))
       .then((data: WalletOption[]) => {
         if (!active) return;
         setWallets(data || []);
        if (data && data.length) {
          setWalletIds(data.map((w) => w.id));
        }
       })
       .catch(() => {
         if (!active) return;
         setWallets([]);
       });
     return () => {
       active = false;
     };
   }, []);
 
   return (
     <div className="w-full h-full flex flex-col gap-4">
       <PeriodFilterHeader title="Dashboard financeiro" />
 
       <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {walletIds.length === wallets.length || walletIds.length === 0
                ? "Todas as carteiras"
                : `${walletIds.length} carteiras selecionadas`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Filtrar por carteira</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={walletIds.length === wallets.length}
              onCheckedChange={(checked) =>
                setWalletIds(checked ? wallets.map((w) => w.id) : [])
              }
            >
              Todas as carteiras
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {wallets.map((wallet) => {
              const checked = walletIds.includes(wallet.id);
              return (
                <DropdownMenuCheckboxItem
                  key={wallet.id}
                  checked={checked}
                  onCheckedChange={(c) => {
                    setWalletIds((prev) => {
                      if (c) return [...prev, wallet.id];
                      return prev.filter((id) => id !== wallet.id);
                    });
                  }}
                >
                  {wallet.name}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
       </div>
 
      <Summary walletIds={walletIds.length ? walletIds : undefined} />
 
       <section className="w-full grid grid-cols-1 lg:grid-cols-4 gap-4">
         <div className="lg:col-span-2 xl:col-span-1 ">
          <ChartPieDonut walletIds={walletIds.length ? walletIds : undefined} />
         </div>
         <div className="lg:col-span-2 xl:col-span-3 ">
          <ChartAreaFinance walletIds={walletIds.length ? walletIds : undefined} />
         </div>
       </section>
 
       <section>
        <TransactionsTable walletIds={walletIds.length ? walletIds : undefined} />
       </section>
     </div>
   );
 }
