import { Suspense, use, useMemo } from "react";
import { Scale, Undo } from "lucide-react";

import {
  getLabelTraits,
  getLatestYear,
  loadCropData,
  loadSpeciesManifest,
  parseRecommendedRegion,
} from "@/utils/loadData";
import { useAction } from "@/hooks/useAction";
import type { AppAction, AppState, SortDir } from "@/hooks/useAction";
import { Button } from "@/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/ui/pagination";
import { Toolbar } from "@/components/Toolbar";
import { VarietyTable } from "@/components/VarietyTable";
import { SpeciesPicker } from "@/components/SpeciesPicker";
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

function range(start: number, end: number): number[] {
  if (end < start) return [];
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function getPageNumbers(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  const boundaryCount = 1;
  const siblingCount = 1;
  const page = current + 1;

  if (total <= boundaryCount * 2 + siblingCount * 2 + 3) {
    return range(0, total - 1);
  }

  const startPages = range(1, boundaryCount);
  const endPages = range(total - boundaryCount + 1, total);

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, total - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages[0] - 2,
  );

  const items: (number | "ellipsis")[] = [];
  items.push(...startPages.map((n) => n - 1));

  if (siblingsStart > boundaryCount + 2) {
    items.push("ellipsis");
  } else if (boundaryCount + 1 < total - boundaryCount) {
    items.push(boundaryCount);
  }

  items.push(...range(siblingsStart, siblingsEnd).map((n) => n - 1));

  if (siblingsEnd < total - boundaryCount - 1) {
    items.push("ellipsis");
  } else if (total - boundaryCount < total) {
    items.push(total - boundaryCount - 1);
  }

  items.push(...endPages.map((n) => n - 1));

  return items;
}

interface ComparerProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

function SpeciesView({ state, dispatch }: ComparerProps) {
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
      <div className="mb-5 flex items-end justify-between gap-4">
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
            className="px-4 shadow-sm"
            onClick={() => dispatch({ type: "OPEN_MODAL", modal: "compare" })}
          >
            <Scale className="size-4" />
            <span className="hidden sm:inline">Porównaj</span>
            <span className="hidden rounded-md bg-white/20 px-1.5 py-0.5 text-xs font-semibold sm:inline">
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
        <div className="flex flex-wrap items-center justify-center gap-3 border-t border-border bg-muted px-4 py-3 text-sm text-muted-foreground sm:justify-between">
          <span className="hidden sm:inline">
            Zaznaczono <b>{selCount}</b> z {total}
          </span>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={page === 0}
                  className={page === 0 ? "pointer-events-none opacity-50" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch({ type: "SET_PAGE", page: Math.max(0, page - 1) });
                  }}
                />
              </PaginationItem>
              {getPageNumbers(page, pages).map((item, i) =>
                item === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink
                      href="#"
                      isActive={item === page}
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch({ type: "SET_PAGE", page: item });
                      }}
                    >
                      {item + 1}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={page === pages - 1}
                  className={
                    page === pages - 1 ? "pointer-events-none opacity-50" : ""
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch({
                      type: "SET_PAGE",
                      page: Math.min(pages - 1, page + 1),
                    });
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

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

export default function App() {
  const [state, dispatch] = useAction();

  return (
    <main className="bg-background text-foreground">
      <div className="mx-auto max-w-6xl p-6">
        <Suspense
          fallback={
            <div className="py-20 text-center text-muted-foreground">
              Ładowanie…
            </div>
          }
        >
          {state.species ? (
            <SpeciesView state={state} dispatch={dispatch} />
          ) : (
            <SpeciesPicker dispatch={dispatch} />
          )}
        </Suspense>
      </div>
    </main>
  );
}
