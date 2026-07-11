import { use, useMemo } from "react";
import { ChevronLeft, ChevronRight, Scale, Undo } from "lucide-react";

import {
  getLatestYear,
  loadCropData,
  loadSpeciesManifest,
  parseRecommendedRegion,
} from "@/utils/loadData";
import type {
  ComparerAction,
  ComparerState,
  SortDir,
} from "@/hooks/useComparer";
import { getLabelTraits } from "@/utils/traits";
import { Button } from "@/ui/button";
import { Toolbar } from "@/components/Toolbar";
import { VarietyTable } from "@/views/VarietyTable";
import { LegendModal } from "@/modals/LegendModal";
import { SortModal } from "@/modals/SortModal";
import { FiltersModal } from "@/modals/FiltersModal";
import { VarietyDetailModal } from "@/modals/VarietyDetailModal";
import { CompareModal } from "@/modals/CompareModal";

const PAGE_SIZE = 10;

export interface VarietyRow {
  name: string;
  year: string;
  primary: Record<string, string>;
  secondary: Record<string, string>;
  recommendedRegions: Record<string, string>;
}

function getSortValue(row: VarietyRow, key: string): string {
  if (key === "name") return row.name;
  return row.primary[key] ?? row.secondary[key] ?? "";
}

function compareRows(a: VarietyRow, b: VarietyRow, key: string, dir: SortDir) {
  const av = getSortValue(a, key);
  const bv = getSortValue(b, key);
  const an = Number(av);
  const bn = Number(bv);
  const result =
    av !== "" && bv !== "" && !Number.isNaN(an) && !Number.isNaN(bn)
      ? an - bn
      : av.localeCompare(bv, "pl");
  return dir === "asc" ? result : -result;
}

interface ComparerProps {
  state: ComparerState;
  dispatch: React.Dispatch<ComparerAction>;
}

export function Comparer({ state, dispatch }: ComparerProps) {
  const dataset = use(loadCropData(state.species!));
  const manifest = use(loadSpeciesManifest());
  const speciesName =
    manifest.species.find((s) => s.id === state.species)?.name ?? state.species;

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    for (const entry of Object.values(dataset.odmiany)) {
      for (const year of Object.keys(entry.years)) years.add(year);
    }
    return Array.from(years).sort().reverse();
  }, [dataset]);

  const allRows = useMemo<VarietyRow[]>(() => {
    return Object.entries(dataset.odmiany).flatMap(([name, entry]) => {
      const year = state.yearFilter
        ? entry.years[state.yearFilter]
          ? state.yearFilter
          : undefined
        : getLatestYear(entry);
      if (!year) return [];
      const yearData = entry.years[year];
      return [
        {
          name,
          year,
          primary: yearData.primary_traits,
          secondary: yearData.secondary_traits,
          recommendedRegions: entry.recommended_regions,
        },
      ];
    });
  }, [dataset, state.yearFilter]);

  const labelTraits = useMemo(
    () => getLabelTraits(dataset.schema),
    [dataset.schema],
  );

  const filtered = useMemo(() => {
    return allRows
      .filter((row) =>
        state.search
          ? row.name.toLowerCase().includes(state.search.toLowerCase())
          : true,
      )
      .filter((row) =>
        labelTraits.every((trait) => {
          const filterValue = state.labelFilters[trait.key];
          if (!filterValue) return true;
          return getSortValue(row, trait.key) === filterValue;
        }),
      )
      .filter((row) =>
        state.regionFilter
          ? parseRecommendedRegion(
              row.recommendedRegions[state.regionFilter] ?? "-",
            ).registered
          : true,
      )
      .sort((a, b) => compareRows(a, b, state.sortKey, state.sortDir));
  }, [
    allRows,
    labelTraits,
    state.search,
    state.labelFilters,
    state.regionFilter,
    state.sortKey,
    state.sortDir,
  ]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(state.page, pages - 1);
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const selCount = state.selected.size;
  const selectedRows = allRows.filter((row) => state.selected.has(row.name));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight whitespace-nowrap">
            Porównywarka odmian
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {speciesName} · {total} odmian
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            className="px-4 shadow-sm"
            onClick={() => dispatch({ type: "BACK_TO_SPECIES" })}
          >
            <Undo className="size-4" />
            <span className="hidden sm:inline">Cofnij</span>
          </Button>
          <Button
            variant="brand"
            size="lg"
            className="hidden px-4 shadow-sm sm:inline-flex"
            onClick={() => dispatch({ type: "OPEN_MODAL", modal: "compare" })}
          >
            <Scale className="size-4" />
            Porównaj
            <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-xs font-semibold">
              {selCount}
            </span>
          </Button>
        </div>
      </div>

      <Toolbar state={state} dispatch={dispatch} />

      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <VarietyTable
          schema={dataset.schema}
          rows={pageRows}
          state={state}
          dispatch={dispatch}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
          <span>
            Zaznaczono <b>{selCount}</b> z {total}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                dispatch({ type: "SET_PAGE", page: Math.max(0, page - 1) })
              }
            >
              <ChevronLeft className="size-3.5" />
              Poprzednia
            </Button>
            <span className="px-1 tabular-nums">
              {page + 1} / {pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                dispatch({
                  type: "SET_PAGE",
                  page: Math.min(pages - 1, page + 1),
                })
              }
            >
              Następna
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {selCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-brand bg-brand px-4 py-3 text-brand-foreground sm:hidden">
          <span className="flex items-center gap-1.5 text-sm">
            <Scale className="size-4" />
            Zaznaczono {selCount} odmian
          </span>
          <Button
            variant="brand"
            className="rounded-full bg-background px-4 text-brand hover:bg-background/90"
            onClick={() => dispatch({ type: "OPEN_MODAL", modal: "compare" })}
          >
            Porównaj
          </Button>
        </div>
      )}

      <LegendModal
        open={state.activeModal === "legend"}
        onClose={() => dispatch({ type: "CLOSE_MODAL" })}
      />
      <SortModal
        open={state.activeModal === "sort"}
        onClose={() => dispatch({ type: "CLOSE_MODAL" })}
        schema={dataset.schema}
        state={state}
        dispatch={dispatch}
      />
      <FiltersModal
        open={state.activeModal === "filters"}
        onClose={() => dispatch({ type: "CLOSE_MODAL" })}
        schema={dataset.schema}
        rows={allRows}
        years={availableYears}
        state={state}
        dispatch={dispatch}
      />
      <VarietyDetailModal
        open={state.activeModal === "detail"}
        onClose={() => dispatch({ type: "CLOSE_MODAL" })}
        crop={state.species!}
        schema={dataset.schema}
        entry={
          state.detailVariety ? dataset.odmiany[state.detailVariety] : undefined
        }
        varietyName={state.detailVariety}
        state={state}
        dispatch={dispatch}
      />
      <CompareModal
        open={state.activeModal === "compare"}
        onClose={() => dispatch({ type: "CLOSE_MODAL" })}
        schema={dataset.schema}
        rows={selectedRows}
      />
    </div>
  );
}
