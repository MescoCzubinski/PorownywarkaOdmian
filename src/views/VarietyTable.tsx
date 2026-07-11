import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";

import type { CropSchema } from "@/utils/loadData";
import type { ComparerAction, ComparerState } from "@/hooks/useComparer";
import type { VarietyRow } from "@/views/Comparer";
import { getLabelTraits, getPrimaryTraits } from "@/utils/traits";
import { getIcon } from "@/utils/icons";
import { formatNumber, formatUnit } from "@/utils/format";
import { Checkbox } from "@/ui/checkbox";
import { cn } from "@/utils/utils";

const DESKTOP_COLS =
  "grid-cols-[40px_minmax(130px,1.6fr)_repeat(var(--trait-cols),1fr)_.95fr_40px]";
const MOBILE_COLS = "max-sm:grid-cols-[34px_minmax(0,1.6fr)_1fr_32px]";

interface VarietyTableProps {
  schema: CropSchema;
  rows: VarietyRow[];
  state: Pick<ComparerState, "selected" | "extraCol" | "sortKey" | "sortDir">;
  dispatch: React.Dispatch<ComparerAction>;
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

function SortHeader({ label, active, dir, align = "end", onSort }: SortHeaderProps) {
  return (
    <button
      type="button"
      onClick={onSort}
      className={cn(
        "flex w-full items-center gap-1 bg-transparent p-0 font-medium hover:text-foreground",
        align === "start" && "justify-start",
        align === "end" && "justify-end",
        align === "center" && "justify-center",
        active && "text-foreground",
      )}
    >
      {label}
      {active &&
        (dir === "asc" ? (
          <ChevronUp className="size-3" />
        ) : (
          <ChevronDown className="size-3" />
        ))}
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
  const badgeTrait = labelTraits[0];
  const subtitleTrait = labelTraits[1];
  const extraTrait = state.extraCol
    ? (schema.primary_traits[state.extraCol] ??
      schema.secondary_traits[state.extraCol])
    : undefined;
  const lastColLabel = extraTrait
    ? extraTrait.name.split(" ")[0]
    : (badgeTrait?.name.split(" ")[0] ?? "");
  const lastColKey = state.extraCol ?? badgeTrait?.key;
  const gridStyle = { "--trait-cols": fixedTraits.length } as React.CSSProperties;

  const names = rows.map((r) => r.name);
  const allSelected =
    names.length > 0 && names.every((n) => state.selected.has(n));

  return (
    <div>
      <div
        style={gridStyle}
        className={cn(
          "grid h-[42px] items-center border-b border-border bg-muted text-xs font-medium text-muted-foreground",
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
            onSort={() => dispatch({ type: "SET_SORT", key: "name", isExtra: false })}
          />
        </div>
        {fixedTraits.map((trait, i) => {
          const Icon = getIcon(trait.icon);
          return (
            <div
              key={trait.key}
              className={cn("flex items-center pr-3.5", i > 0 && "max-sm:hidden")}
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
                  dispatch({ type: "SET_SORT", key: trait.key, isExtra: false })
                }
              />
            </div>
          );
        })}
        <div className="flex items-center max-sm:hidden">
          {lastColKey && (
            <SortHeader
              label={lastColLabel}
              align="center"
              active={state.sortKey === lastColKey}
              dir={state.sortDir}
              onSort={() =>
                dispatch({
                  type: "SET_SORT",
                  key: lastColKey,
                  isExtra: !!extraTrait,
                })
              }
            />
          )}
        </div>
        <div />
      </div>

      {rows.map((row) => {
        const selected = state.selected.has(row.name);
        const badgeVal = badgeTrait ? traitValue(row, badgeTrait.key) : undefined;
        const subtitleVal = subtitleTrait
          ? traitValue(row, subtitleTrait.key)
          : undefined;
        const extraVal = state.extraCol
          ? traitValue(row, state.extraCol)
          : undefined;

        return (
          <div
            key={row.name}
            style={gridStyle}
            onClick={() => dispatch({ type: "OPEN_DETAIL", variety: row.name })}
            className={cn(
              "grid h-[52px] cursor-pointer items-center border-b border-border text-sm hover:bg-muted/50",
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
              <span className="block truncate font-semibold">
                {row.name}
              </span>
              {subtitleVal && (
                <span className="text-xs text-muted-foreground sm:hidden">
                  {subtitleVal}
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
                    "pr-3.5",
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
            <div className="flex items-center justify-center max-sm:hidden">
              {extraTrait ? (
                <span className="text-sm font-semibold tabular-nums">
                  {extraVal !== undefined ? formatNumber(extraVal) : ""}
                </span>
              ) : (
                <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
                  {badgeVal}
                </span>
              )}
            </div>
            <div className="flex justify-center text-muted-foreground">
              <ChevronRight className="size-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
