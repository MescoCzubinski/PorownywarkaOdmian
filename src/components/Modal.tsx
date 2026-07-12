import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { cn } from "@/utils/utils";
import { Button } from "@/ui/button";

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
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-foreground/40 backdrop-1 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
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
  );
}

export function ModalHeader({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border p-4">
      {children}
      <Button
        variant="outline"
        size="icon"
        className="ml-auto"
        onClick={onClose}
      >
        <X className="size-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
