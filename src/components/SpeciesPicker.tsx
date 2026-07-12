import { use } from "react";

import { loadSpeciesManifest } from "@/utils/loadData";
import type { AppAction } from "@/hooks/useAction";
import { Button } from "@/ui/button";
import { cn } from "@/utils/utils";

interface SpeciesPickerProps {
  dispatch: React.Dispatch<AppAction>;
}

export function SpeciesPicker({ dispatch }: SpeciesPickerProps) {
  const manifest = use(loadSpeciesManifest());

  return (
    <div>
      <h1 className="text-lg font-bold">Wybierz gatunek</h1>

      {manifest.categories.map((category) => {
        const items = manifest.species.filter(
          (s) => s.category === category.id,
        );

        return (
          <div key={category.id}>
            <div className="mt-5 mb-2 text-xs font-bold text-brand uppercase">
              {category.name}
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2">
              {items.map((sp) => {
                const enabled = !!sp.dataFile;
                return (
                  <Button
                    key={sp.id}
                    variant="ghost"
                    disabled={!enabled}
                    onClick={() =>
                      dispatch({ type: "SELECT_SPECIES", species: sp.id })
                    }
                    className={cn(
                      "h-auto justify-start px-3 py-2.5 text-sm font-medium",
                      enabled
                        ? "cursor-pointer border-brand bg-brand/10 text-brand hover:bg-brand/15"
                        : "cursor-default border-border bg-muted text-muted-foreground",
                    )}
                  >
                    <span className="text-left">{sp.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
