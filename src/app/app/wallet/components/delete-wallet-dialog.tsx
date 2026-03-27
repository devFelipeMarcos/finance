import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useWalllets } from "@/hooks/use-wallets";
import { Trash2 } from "lucide-react";

type DeleteWalletDialogProps = {
  id: string;
  isCard?: boolean;
};

export function DeleteWalletDialog({ id, isCard = false }: DeleteWalletDialogProps) {
  const { deleteWallets } = useWalllets();

  function handleDeleteWallet(deleteId: string) {
    deleteWallets.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Carteira apagada com sucesso!");
      },
      onError: () => {
        toast.error("Erro ao apagar carteira!");
      },
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          size="icon" 
          variant="ghost" 
          className={`h-8 w-8 ${isCard ? "text-white hover:bg-white/20" : "text-red-500 hover:text-red-600 hover:bg-red-500/10"}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir carteira?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente sua
            carteira e todas as transações relacionadas a ela.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleDeleteWallet(id)}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
