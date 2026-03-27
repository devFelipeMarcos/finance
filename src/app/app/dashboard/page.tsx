import DashboardContent from "./components/dashboard-content";
import { PendingTransactionsModalWrapper } from "@/components/pending-transactions-modal-wrapper";

export const metadata = {
  title: "Dashboard | Balancefy",
  description:
    "Acompanhe seu resumo financeiro com gráficos e estatísticas em tempo real. Veja suas entradas, saídas e saldo atual em um só lugar.",
};

const Dashboard = () => {
  return (
    <>
      <DashboardContent />
      <PendingTransactionsModalWrapper />
    </>
  );
};

export default Dashboard;
