import { createContext, useContext, useId } from "react";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { cn } from "@/utils/utils";
import { Button } from "@/ui/button";

const ModalTitleIdContext = createContext<string>("");

export function ModalTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const id = useContext(ModalTitleIdContext);
  return (
    <DialogPrimitive.Title id={id} className={className}>
      {children}
    </DialogPrimitive.Title>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  width?: "default" | "wide";
  children: React.ReactNode;
}

export function Modal({
  open,
  onClose,
  width = "default",
  children,
}: ModalProps) {
  const titleId = useId();
  return (
    <ModalTitleIdContext.Provider value={titleId}>
      <DialogPrimitive.Root
        open={open}
        onOpenChange={(next) => {
          if (!next) onClose();
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-foreground/40 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <DialogPrimitive.Popup
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn(
              "fixed top-1/2 left-1/2 z-50 flex h-125 max-h-modal -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-background shadow-modal outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
              width === "wide"
                ? "w-90 max-w-modal sm:w-full sm:max-w-160"
                : "w-90 max-w-modal sm:w-105",
            )}
          >
            {children}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </ModalTitleIdContext.Provider>
  );
}

export function ModalHeader({
  children,
  actions,
  onClose,
}: {
  children: React.ReactNode;
  actions?: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border p-4">
      {children}
      <div className="ml-auto flex items-center gap-2">
        {actions}
        {onClose && (
          <Button
            variant="outline"
            size="icon"
            aria-label="Zamknij"
            onClick={onClose}
          >
            <X className="size-4 text-muted-foreground" />
          </Button>
        )}
      </div>
    </div>
  );
}
