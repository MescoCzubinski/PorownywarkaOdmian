import { ArrowUpDown, Filter, Info, Search } from "lucide-react";

import type { AppAction, AppState } from "@/hooks/useAction";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

interface ToolbarProps {
  state: Pick<
    AppState,
    "search" | "labelFilters" | "regionFilter" | "yearFilter"
  >;
  dispatch: React.Dispatch<AppAction>;
}

export function Toolbar({ state, dispatch }: ToolbarProps) {
  const activeFilterCount =
    Object.values(state.labelFilters).filter(Boolean).length +
    (state.regionFilter ? 1 : 0) +
    (state.yearFilter ? 1 : 0);

  return (
    <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
      <div className="focus-within:border-brand focus-within:ring-brand/15 flex h-9 max-w-xs min-w-48 flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 focus-within:ring-3">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <Input
          value={state.search}
          onChange={(e) =>
            dispatch({ type: "SET_SEARCH", value: e.target.value })
          }
          placeholder="Szukaj odmiany…"
          className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
        />
      </div>

      <Button
        variant="outline"
        className="h-9 px-3"
        onClick={() => dispatch({ type: "OPEN_MODAL", modal: "filters" })}
      >
        <Filter className="size-3.5" />
        <span className="hidden sm:inline">Filtry</span>
        {activeFilterCount > 0 && (
          <span className="rounded-md bg-brand/10 px-1.5 py-0.5 text-xs font-semibold text-brand">
            {activeFilterCount}
          </span>
        )}
      </Button>

      <Button
        variant="outline"
        className="h-9 px-3"
        onClick={() => dispatch({ type: "OPEN_MODAL", modal: "sort" })}
      >
        <ArrowUpDown className="size-3.5" />
        <span className="hidden sm:inline">Sortuj</span>
      </Button>

      <Button
        variant="outline"
        className="h-9 px-3"
        onClick={() => dispatch({ type: "OPEN_MODAL", modal: "legend" })}
      >
        <Info className="size-3.5" />
        <span className="hidden sm:inline">Legenda</span>
      </Button>
    </div>
  );
}
