import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";

import {
  getLabelTraits,
  getPrimaryTraits,
  type CropSchema,
} from "@/utils/loadData";
import type { AppAction, AppState } from "@/hooks/useAction";
import type { VarietyRow } from "@/App";
import { getIcon } from "@/utils/icons";
import { formatNumber, formatUnit } from "@/utils/format";
import { Checkbox } from "@/ui/checkbox";
import { cn } from "@/utils/utils";

const DESKTOP_COLS = "grid-cols-variety-desktop";
const MOBILE_COLS = "max-sm:grid-cols-variety-mobile";

interface VarietyTableProps {
  schema: CropSchema;
  rows: VarietyRow[];
  state: Pick<AppState, "selected" | "sortKey" | "sortDir">;
  dispatch: React.Dispatch<AppAction>;
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
  const gridStyle = {
    "--trait-cols": fixedTraits.length,
  } as React.CSSProperties;

  const names = rows.map((r) => r.name);
  const allSelected =
    names.length > 0 && names.every((n) => state.selected.has(n));

  return (
    <div>
      <div
        style={gridStyle}
        className={cn(
          "grid h-10 items-center border-b border-border bg-muted text-xs font-medium text-muted-foreground",
          DESKTOP_COLS,
          MOBILE_COLS,
        )}
      >
        <div className="flex justify-center">
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={allSelected}
              onCheckedChange={() =>
                dispatch({ type: "TOGGLE_ALL_ON_PAGE", varieties: names })
              }
              className="size-4 border-muted-foreground data-checked:border-brand data-checked:bg-brand"
            />
          </div>
        </div>
        <div className="pl-1">
          <SortHeader
            label="Odmiana"
            align="start"
            active={state.sortKey === "name"}
            dir={state.sortDir}
            onSort={() =>
              dispatch({ type: "SET_SORT", key: "name", numeric: false })
            }
          />
        </div>
        {fixedTraits.map((trait, i) => {
          const Icon = getIcon(trait.icon);
          return (
            <div
              key={trait.key}
              className={cn(
                "flex items-center pr-3.5",
                i > 0 && "max-sm:hidden",
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
            </div>
          );
        })}
        <div />
      </div>

      {rows.map((row) => {
        const selected = state.selected.has(row.name);
        const subtitleTraits = labelTraits.filter((trait) =>
          traitValue(row, trait.key),
        );

        return (
          <div
            key={row.name}
            style={gridStyle}
            onClick={() => dispatch({ type: "OPEN_DETAIL", variety: row.name })}
            className={cn(
              "grid h-12 cursor-pointer items-center border-b border-border text-sm hover:bg-muted/50",
              DESKTOP_COLS,
              MOBILE_COLS,
            )}
          >
            <div className="flex justify-center">
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selected}
                  onCheckedChange={() =>
                    dispatch({ type: "TOGGLE_VARIETY", variety: row.name })
                  }
                  className="size-4 border-muted-foreground data-checked:border-brand data-checked:bg-brand"
                />
              </div>
            </div>
            <div className="min-w-0 pl-1">
              <span className="block truncate font-semibold">{row.name}</span>
              {subtitleTraits.length > 0 && (
                <span className="block truncate text-xs text-muted-foreground sm:hidden">
                  {subtitleTraits
                    .map((trait) => traitValue(row, trait.key))
                    .join(" · ")}
                </span>
              )}
            </div>
            {fixedTraits.map((trait, i) => {
              const raw = traitValue(row, trait.key);
              return (
                <div
                  key={trait.key}
                  className={cn(
                    "text-right font-medium tabular-nums",
                    "pr-7.5",
                    i > 0 && "max-sm:hidden",
                  )}
                >
                  {raw !== undefined ? formatNumber(raw) : ""}
                  <span className="text-xs font-normal text-muted-foreground">
                    {formatUnit(trait.unit)}
                  </span>
                </div>
              );
            })}
            <div className="flex justify-center text-muted-foreground">
              <ChevronRight className="size-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
