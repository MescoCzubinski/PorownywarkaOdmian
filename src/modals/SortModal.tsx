import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ArrowUpDown, ChevronDown, ChevronUp, Tag } from "lucide-react";

import type { CropSchema } from "@/utils/loadData";
import type { ComparerAction, ComparerState } from "@/hooks/useComparer";
import { getOrderedTraits, getPrimaryTraits } from "@/utils/traits";
import { getIcon } from "@/utils/icons";
import { Modal, ModalHeader } from "@/components/Modal";
import { cn } from "@/utils/utils";

interface SortModalProps {
  open: boolean;
  onClose: () => void;
  schema: CropSchema;
  state: Pick<ComparerState, "sortKey" | "sortDir">;
  dispatch: React.Dispatch<ComparerAction>;
}

export function SortModal({
  open,
  onClose,
  schema,
  state,
  dispatch,
}: SortModalProps) {
  const traits = getOrderedTraits(schema);
  const fixedKeys = new Set(getPrimaryTraits(schema).map((t) => t.key));

  const rows = [
    { key: "name", label: "Odmiana (A–Z)", icon: Tag, isExtra: false },
    ...traits.map((trait) => ({
      key: trait.key,
      label: trait.name,
      icon: getIcon(trait.icon) ?? Tag,
      isExtra: !fixedKeys.has(trait.key),
    })),
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        <ArrowUpDown className="size-4 text-brand" />
        <DialogPrimitive.Title className="text-base font-bold">
          Sortuj według
        </DialogPrimitive.Title>
      </ModalHeader>
      <div className="min-h-0 flex-1 overflow-y-auto py-1.5 pl-1.5">
        {rows.map((row) => {
          const active = state.sortKey === row.key;
          const Icon = row.icon;
          return (
            <div
              key={row.key}
              onClick={() =>
                dispatch({
                  type: "SET_SORT",
                  key: row.key,
                  isExtra: row.isExtra,
                })
              }
              className={cn(
                "flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted",
                active
                  ? "bg-brand/10 font-semibold text-brand"
                  : "text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "size-4",
                  active ? "text-brand" : "text-muted-foreground",
                )}
              />
              {row.label}
              {active &&
                (state.sortDir === "asc" ? (
                  <ChevronUp className="ml-auto size-4 text-brand" />
                ) : (
                  <ChevronDown className="ml-auto size-4 text-brand" />
                ))}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
