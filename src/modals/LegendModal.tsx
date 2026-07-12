import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Info } from "lucide-react";

import { Modal, ModalHeader } from "@/components/Modal";
import { List, ListItem } from "@/ui/list";

interface LegendModalProps {
  open: boolean;
  onClose: () => void;
}

export function LegendModal({ open, onClose }: LegendModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        <Info className="size-4 text-brand" />
        <DialogPrimitive.Title className="text-base font-bold">
          Legenda
        </DialogPrimitive.Title>
      </ModalHeader>
      <List className="min-h-0 flex-1 overflow-y-auto p-4 text-md">
        <ListItem>
          <span className="w-5 text-center font-mono font-semibold text-muted-foreground">
            #
          </span>
          brak danych dla danej odmiany
        </ListItem>
        <ListItem>
          <span className="w-5 text-center font-mono font-semibold text-muted-foreground">
            a₁
          </span>
          niski poziom agrotechniki
        </ListItem>
        <ListItem>
          <span className="w-5 text-center font-mono font-semibold text-muted-foreground">
            a₂
          </span>
          wysoki poziom agrotechniki
        </ListItem>
        <ListItem className="gap-4">
          <span className="w-5 text-center font-mono font-semibold text-muted-foreground">
            LOZ
          </span>
          Lista Odmian Zalecanych
        </ListItem>
        <ListItem>
          <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
            R
          </span>
          wstępna rekomendacja (LOZ)
        </ListItem>
        <ListItem>
          <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
            CCA
          </span>
          odmiana z katalogu UE
        </ListItem>
        <ListItem>
          wartości bez jednostki są wyrażone w skali 1-9
        </ListItem>
      </List>
      <div className="mx-4 mb-4 border-t border-border pt-3 text-sm text-muted-foreground">
        Źródło danych: Porejestrowe Doświadczalnictwo Odmianowe — Centralny
        Ośrodek Badania Odmian Roślin Uprawnych (COBORU)
      </div>
    </Modal>
  );
}
