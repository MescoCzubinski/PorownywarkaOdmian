import type { Dispatch } from "react";

import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";

import {
  getLabelTraits,
  getOrderedTraits,
  getPrimaryTraits,
  type CropSchema,
} from "@/utils/loadData";
import type { AppAction, AppState } from "@/hooks/useAction";
import type { VarietyRow } from "@/App";
import { getIcon } from "@/utils/icons";
import { formatNumber, formatUnit } from "@/utils/format";
import { Checkbox } from "@/ui/checkbox";
import { cn } from "@/utils/utils";

interface VarietyTableProps {
  schema: CropSchema;
  rows: VarietyRow[];
  state: Pick<AppState, "selected" | "sortKey" | "sortDir" | "swappedTrait">;
  dispatch: Dispatch<AppAction>;
}

function traitValue(row: VarietyRow, key: string): string | undefined {
  return row.primary[key] ?? row.secondary[key];
}

interface SortHeaderProps {
  label: React.ReactNode;
  active: boolean;
  dir: "asc" | "desc";
  align?: "start" | "end" | "center";
  onSort: () => void;
}

function SortHeader({
  label,
  active,
  dir,
  align = "end",
  onSort,
}: SortHeaderProps) {
  const Icon = dir === "asc" ? ChevronUp : ChevronDown;

  return (
    <button
      type="button"
      onClick={onSort}
      className={cn(
        "flex w-full items-center gap-1 bg-transparent p-0 font-medium hover:text-foreground",
        align === "start" && "justify-start",
        align === "end" && "justify-end",
        align === "center" && "justify-center",
        active && "font-bold text-brand hover:text-brand",
      )}
    >
      {label}
      {active ? (
        <Icon className="size-3 shrink-0 text-brand" />
      ) : (
        <span className="size-3 shrink-0" />
      )}
    </button>
  );
}

export function VarietyTable({
  schema,
  rows,
  state,
  dispatch,
}: VarietyTableProps) {
  const fixedTraits = getPrimaryTraits(schema);
  const labelTraits = getLabelTraits(schema);

  const swapped = state.swappedTrait
    ? getOrderedTraits(schema).find((t) => t.key === state.swappedTrait)
    : undefined;
  const swappedIsPrimary =
    swapped !== undefined && fixedTraits.some((t) => t.key === swapped.key);
  const columnTraits =
    swapped && !swappedIsPrimary
      ? [...fixedTraits.slice(0, -1), swapped]
      : fixedTraits;
  const mobileKey = (swapped ?? fixedTraits[0]).key;

  const names = rows.map((r) => r.name);
  const allSelected =
    names.length > 0 && names.every((n) => state.selected.has(n));

  return (
    <table className="w-full">
      <thead className="border-b border-border">
        <tr className="h-10 bg-muted text-xs font-medium text-muted-foreground">
          <th scope="col" className="w-10 p-0 max-sm:w-8.5">
            <div className="flex justify-center">
              <Checkbox
                aria-label="Zaznacz wszystkie odmiany"
                checked={allSelected}
                onCheckedChange={() =>
                  dispatch({ type: "TOGGLE_ALL_ON_PAGE", varieties: names })
                }
                className="size-4 border-muted-foreground data-checked:border-brand data-checked:bg-brand"
              />
            </div>
          </th>
          <th scope="col" className="p-0 pl-1">
            <SortHeader
              label="Odmiana"
              align="start"
              active={state.sortKey === "name"}
              dir={state.sortDir}
              onSort={() =>
                dispatch({ type: "SET_SORT", key: "name", numeric: false })
              }
            />
          </th>
          {columnTraits.map((trait) => {
            const Icon = getIcon(trait.icon);
            return (
              <th
                key={trait.key}
                scope="col"
                className={cn(
                  "p-0 pr-3.5",
                  trait.key !== mobileKey && "max-sm:hidden",
                )}
              >
                <SortHeader
                  label={
                    <>
                      {Icon && <Icon className="size-3.5" />}
                      {trait.name}
                    </>
                  }
                  active={state.sortKey === trait.key}
                  dir={state.sortDir}
                  onSort={() =>
                    dispatch({
                      type: "SET_SORT",
                      key: trait.key,
                      numeric: trait.type === "number",
                    })
                  }
                />
              </th>
            );
          })}
          <th scope="col" className="w-10 p-0 max-sm:w-8">
            <span className="sr-only">Szczegóły</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {rows.map((row) => {
          const selected = state.selected.has(row.name);
          const subtitleTraits = labelTraits.filter((trait) =>
            traitValue(row, trait.key),
          );

          return (
            <tr
              key={row.name}
              tabIndex={0}
              onClick={() =>
                dispatch({ type: "OPEN_DETAIL", variety: row.name })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  dispatch({ type: "OPEN_DETAIL", variety: row.name });
                }
              }}
              className="h-12 cursor-pointer text-sm hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              <td className="p-0">
                <div
                  className="flex justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    aria-label={`Zaznacz ${row.name}`}
                    checked={selected}
                    onCheckedChange={() =>
                      dispatch({ type: "TOGGLE_VARIETY", variety: row.name })
                    }
                    className="size-4 border-muted-foreground data-checked:border-brand data-checked:bg-brand"
                  />
                </div>
              </td>
              <td className="min-w-0 p-0 pl-1">
                <span className="block truncate font-semibold">{row.name}</span>
                {subtitleTraits.length > 0 && (
                  <span className="block truncate text-xs text-muted-foreground sm:hidden">
                    {subtitleTraits
                      .map((trait) => traitValue(row, trait.key))
                      .join(" · ")}
                  </span>
                )}
              </td>
              {columnTraits.map((trait) => {
                const raw = traitValue(row, trait.key);
                return (
                  <td
                    key={trait.key}
                    className={cn(
                      "p-0 pr-7.5 text-right font-medium tabular-nums",
                      trait.key !== mobileKey && "max-sm:hidden",
                    )}
                  >
                    {trait.type === "label" ? (
                      raw && (
                        <span className="inline-block max-w-full truncate rounded-full bg-brand/10 px-2.5 py-0.5 align-middle text-xs font-semibold text-brand">
                          {raw}
                        </span>
                      )
                    ) : (
                      <>
                        {raw !== undefined ? formatNumber(raw) : ""}
                        <span className="text-xs font-normal text-muted-foreground">
                          {formatUnit(trait.unit)}
                        </span>
                      </>
                    )}
                  </td>
                );
              })}
              <td className="p-0" aria-hidden="true">
                <div className="flex justify-center text-muted-foreground">
                  <ChevronRight className="size-4" />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
