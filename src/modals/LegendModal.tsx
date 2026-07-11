import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Info } from "lucide-react";

import { Modal, ModalHeader } from "@/components/Modal";

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
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 text-sm">
        <div className="flex items-center gap-2.5">
          <span className="w-5 text-center font-mono font-semibold text-muted-foreground">
            #
          </span>
          brak danych dla danej odmiany
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-5 text-center italic text-muted-foreground">
            LOZ
          </span>
          Lista Odmian Zalecanych
        </div>
        <div className="flex items-center gap-2.5">
          <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
            R
          </span>
          wstępna rekomendacja (LOZ)
        </div>
        <div className="flex items-center gap-2.5">
          <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
            CCA
          </span>
          odmiana z katalogu UE
        </div>
        <div className="flex items-center gap-2.5">
          wartości bez jednostki są wyrażone w skali 1-9
        </div>
      </div>
      <div className="mx-4 mb-4 border-t border-border pt-3 text-sm text-muted-foreground">
        Źródło danych: Porejestrowe Doświadczalnictwo Odmianowe — Centralny
        Ośrodek Badania Odmian Roślin Uprawnych (COBORU)
      </div>
    </Modal>
  );
}
