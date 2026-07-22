import type { Dispatch } from "react";

import { ArrowUpDown, ChevronDown, ChevronUp, Tag } from "lucide-react";

import { getOrderedTraits, type CropSchema } from "@/utils/loadData";
import type { AppAction, AppState } from "@/hooks/useAction";
import { getIcon } from "@/utils/icons";
import { Modal, ModalHeader, ModalTitle } from "@/components/Modal";
import { cn } from "@/utils/utils";

interface SortModalProps {
  open: boolean;
  onClose: () => void;
  schema: CropSchema;
  state: Pick<AppState, "sortKey" | "sortDir">;
  dispatch: Dispatch<AppAction>;
}

export function SortModal({
  open,
  onClose,
  schema,
  state,
  dispatch,
}: SortModalProps) {
  const traits = getOrderedTraits(schema);

  const rows = [
    { key: "name", label: "Odmiana (A–Z)", icon: Tag, numeric: false },
    ...traits.map((trait) => ({
      key: trait.key,
      label: trait.name,
      icon: getIcon(trait.icon) ?? Tag,
      numeric: trait.type === "number",
    })),
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        <ArrowUpDown className="size-4 text-brand" />
        <ModalTitle className="text-base font-bold">Sortuj według</ModalTitle>
      </ModalHeader>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {rows.map((row) => {
          const active = state.sortKey === row.key;
          const Icon = row.icon;
          return (
            <div
              key={row.key}
              role="button"
              tabIndex={0}
              aria-pressed={active}
              onClick={() =>
                dispatch({
                  type: "SET_SORT",
                  key: row.key,
                  numeric: row.numeric,
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  dispatch({
                    type: "SET_SORT",
                    key: row.key,
                    numeric: row.numeric,
                  });
                }
              }}
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
