import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Calendar, Eraser, Filter, MapPin, Tag } from "lucide-react";

import { getLabelTraits, type CropSchema } from "@/utils/loadData";
import type { AppAction, AppState } from "@/hooks/useAction";
import type { VarietyRow } from "@/App";
import { getIcon } from "@/utils/icons";
import { Modal, ModalHeader } from "@/components/Modal";
import { Button } from "@/ui/button";
import { Label } from "@/ui/label";
import { Separator } from "@/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

const ALL = "wszystkie";

function traitValue(row: VarietyRow, key: string): string | undefined {
  return row.primary[key] ?? row.secondary[key];
}

interface FiltersModalProps {
  open: boolean;
  onClose: () => void;
  schema: CropSchema;
  rows: VarietyRow[];
  years: string[];
  state: Pick<AppState, "labelFilters" | "regionFilter" | "yearFilter">;
  dispatch: React.Dispatch<AppAction>;
}

export function FiltersModal({
  open,
  onClose,
  schema,
  rows,
  years,
  state,
  dispatch,
}: FiltersModalProps) {
  const labelTraits = getLabelTraits(schema);
  const regions = Object.entries(schema.recommended_regions);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader
        onClose={onClose}
        actions={
          <Button
            variant="outline"
            className="max-sm:size-8"
            onClick={() => dispatch({ type: "CLEAR_FILTERS" })}
          >
            <Eraser className="size-4 text-muted-foreground" />
            <span className="hidden sm:inline">Wyczyść</span>
          </Button>
        }
      >
        <Filter className="size-4 text-brand" />
        <DialogPrimitive.Title className="text-base font-bold">
          Filtry
        </DialogPrimitive.Title>
      </ModalHeader>
      <div className="flex flex-col gap-4 overflow-y-auto p-4">
        <div className="flex flex-col gap-1.5">
          <Label>
            <Calendar className="size-3.5" />
            Rok
          </Label>
          <Select
            value={state.yearFilter || ALL}
            onValueChange={(value) =>
              dispatch({
                type: "SET_YEAR_FILTER",
                value: !value || value === ALL ? "" : value,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {(value: string) => (value === ALL ? "wszystkie lata" : value)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>wszystkie lata</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>
            <MapPin className="size-3.5" />
            Lista Odmian Zalecanych
          </Label>
          <Select
            value={state.regionFilter || ALL}
            onValueChange={(value) =>
              dispatch({
                type: "SET_REGION_FILTER",
                value: !value || value === ALL ? "" : value,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {(value: string) =>
                  value === ALL
                    ? "wszystkie województwa"
                    : (schema.recommended_regions[value]?.name ?? value)
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>wszystkie województwa</SelectItem>
              {regions.map(([key, def]) => (
                <SelectItem key={key} value={key}>
                  {def.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {labelTraits.map((trait) => {
          const Icon = getIcon(trait.icon) ?? Tag;
          const options = Array.from(
            new Set(rows.map((r) => traitValue(r, trait.key)).filter(Boolean)),
          ).sort();

          return (
            <div key={trait.key} className="flex flex-col gap-1.5">
              <Label>
                <Icon className="size-3.5" />
                {trait.name}
              </Label>
              <Select
                value={state.labelFilters[trait.key] || ALL}
                onValueChange={(value) =>
                  dispatch({
                    type: "SET_LABEL_FILTER",
                    key: trait.key,
                    value: !value || value === ALL ? "" : value,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) => (value === ALL ? "wszystkie" : value)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>wszystkie</SelectItem>
                  {options.map((opt) => (
                    <SelectItem key={opt} value={opt!}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
