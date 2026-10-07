import { useState } from "react";

import type { TraitGroup } from "@/utils/loadData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { formatNumber, formatUnit } from "@/utils/format";

const REGIONS = ["I", "II", "III", "IV", "V", "VI"];

function regionColor(value: number, min: number, max: number) {
  const t = max > min ? (value - min) / (max - min) : 0.5;
  const light = 95 - t * 56;
  return {
    bg: `hsl(150 55% ${light}%)`,
    fg: t > 0.62 ? "var(--background)" : "var(--foreground)",
    border: t < 0.2 ? "var(--foreground)" : "transparent",
  };
}

interface RegionalYieldsHeatmapProps {
  regionSchema: TraitGroup;
  regionalYields: Record<string, string>;
}

export function RegionalYieldsHeatmap({
  regionSchema,
  regionalYields,
}: RegionalYieldsHeatmapProps) {
  const [view, setView] = useState<"table" | "map">("table");
  const numericYields = Object.values(regionalYields)
    .filter((v) => v !== "#")
    .map(Number);
  const rMin = Math.min(...numericYields);
  const rMax = Math.max(...numericYields);
  const hasRegionalYields = REGIONS.some((region) =>
    ["a1", "a2"].some((suffix) => {
      const v = regionalYields[`plon_rejon_${region}_${suffix}`];
      return v !== undefined && v !== "#";
    }),
  );

  if (!hasRegionalYields) {
    return (
      <div className="flex h-full pb-4 items-center justify-center text-center text-base text-muted-foreground">
        Brak danych dla tej odmiany
      </div>
    );
  }

  return (
    <Tabs
      value={view}
      onValueChange={(v) => setView(v as "table" | "map")}
      className="min-h-0 flex-1"
    >
      <TabsContent value="table" className="flex min-h-0 flex-col">
        <div className="grid grid-cols-yields gap-1.5 text-lg text-muted-foreground">
          <div>Rejon</div>
          <div className="text-center">a₁</div>
          <div className="text-center">a₂</div>
        </div>
        {REGIONS.map((region) => {
          const v1 = regionalYields[`plon_rejon_${region}_a1`];
          const v2 = regionalYields[`plon_rejon_${region}_a2`];
          const unit1 = formatUnit(
            regionSchema[`plon_rejon_${region}_a1`]?.unit,
          );
          const unit2 = formatUnit(
            regionSchema[`plon_rejon_${region}_a2`]?.unit,
          );
          const c1 =
            v1 !== undefined && v1 !== "#"
              ? regionColor(Number(v1), rMin, rMax)
              : null;
          const c2 =
            v2 !== undefined && v2 !== "#"
              ? regionColor(Number(v2), rMin, rMax)
              : null;
          return (
            <div
              key={region}
              className="mt-1 grid min-h-0 flex-1 grid-cols-yields items-stretch gap-1"
            >
              <div className="flex items-center text-base font-semibold text-muted-foreground">
                {region}
              </div>
              <div
                className="flex items-center justify-center rounded-md border py-1.5 text-center text-sm font-semibold tabular-nums"
                style={{
                  background: c1?.bg,
                  color: c1?.fg,
                  borderColor: c1?.border,
                }}
              >
                {v1 === undefined || v1 === "#" ? (
                  <span className="font-mono text-muted-foreground">#</span>
                ) : (
                  <>
                    {formatNumber(v1)}
                    <span className="text-xs font-normal opacity-80">
                      {unit1}
                    </span>
                  </>
                )}
              </div>
              <div
                className="flex items-center justify-center rounded-md border py-1.5 text-center text-sm font-semibold tabular-nums"
                style={{
                  background: c2?.bg,
                  color: c2?.fg,
                  borderColor: c2?.border,
                }}
              >
                {v2 === undefined || v2 === "#" ? (
                  <span className="font-mono text-muted-foreground">#</span>
                ) : (
                  <>
                    {formatNumber(v2)}
                    <span className="text-xs font-normal opacity-80">
                      {unit2}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </TabsContent>

      <TabsContent value="map" className="flex items-center justify-center">
        <img
          src={`${import.meta.env.BASE_URL}mapka_regiony.png`}
          alt="Legenda rejonów I-VI"
          className="w-full max-w-80"
        />
      </TabsContent>

      <TabsList>
        <TabsTrigger value="table">Tabela</TabsTrigger>
        <TabsTrigger value="map">Mapa rejonów</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
