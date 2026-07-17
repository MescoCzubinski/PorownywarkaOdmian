import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { MapPin, MapPinOff } from "lucide-react";

import type { CropSchema } from "@/utils/loadData";
import type { AppAction } from "@/hooks/useAction";
import { Modal, ModalHeader } from "@/components/Modal";
import { PolandMap } from "@/components/PolandMap";
import { Button } from "@/ui/button";

interface ChooseRegionModalProps {
  open: boolean;
  onClose: () => void;
  schema: CropSchema;
  dispatch: React.Dispatch<AppAction>;
}

export function ChooseRegionModal({
  open,
  onClose,
  schema,
  dispatch,
}: ChooseRegionModalProps) {
  const choose = (value: string) => {
    dispatch({ type: "SET_REGION_FILTER", value });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} width="default">
      <ModalHeader onClose={onClose}>
        <MapPin className="size-4 text-brand" />
        <DialogPrimitive.Title className="text-base font-bold">
          Wybierz województwo
        </DialogPrimitive.Title>
      </ModalHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
        <div className="mx-auto w-full max-w-md">
          <PolandMap
            className="w-full"
            onSelect={choose}
            regionClassName={() => "fill-brand hover:fill-brand/90"}
            renderTitle={(id) => {
              const name = schema.recommended_regions[id]?.name ?? id;
              return name.charAt(0).toLocaleUpperCase("pl") + name.slice(1);
            }}
          />
        </div>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => choose("")}
        >
          <MapPinOff className="size-4" />
          Nie wybieraj województwa
        </Button>
      </div>
    </Modal>
  );
}
