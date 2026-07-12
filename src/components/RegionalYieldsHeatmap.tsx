import { formatNumber } from "@/utils/format";

const REGIONS = ["I", "II", "III", "IV", "V", "VI"];

function regionColor(value: number, min: number, max: number) {
  const t = max > min ? (value - min) / (max - min) : 0.5;
  const light = 95 - t * 56;
  return {
    bg: `hsl(150 55% ${light}%)`,
    fg: t > 0.62 ? "var(--background)" : "var(--foreground)",
  };
}

interface RegionalYieldsHeatmapProps {
  regionalYields: Record<string, string>;
}

export function RegionalYieldsHeatmap({
  regionalYields,
}: RegionalYieldsHeatmapProps) {
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
      <div className="flex h-full items-center justify-center text-center text-md text-muted-foreground">
        Brak danych dla tej odmiany
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-[48px_1fr_1fr] gap-1.5 text-xs text-muted-foreground">
        <div>Rejon</div>
        <div className="text-center">a₁</div>
        <div className="text-center">a₂</div>
      </div>
      {REGIONS.map((region) => {
        const v1 = regionalYields[`plon_rejon_${region}_a1`];
        const v2 = regionalYields[`plon_rejon_${region}_a2`];
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
            className="mt-1.5 grid grid-cols-[48px_1fr_1fr] items-center gap-1.5"
          >
            <div className="text-sm font-semibold text-muted-foreground">
              {region}
            </div>
            <div
              className="rounded-md py-2 text-center text-sm font-semibold tabular-nums"
              style={{ background: c1?.bg, color: c1?.fg }}
            >
              {v1 === "#" ? (
                <span className="font-mono text-muted-foreground">#</span>
              ) : (
                formatNumber(v1 ?? "")
              )}
            </div>
            <div
              className="rounded-md py-2 text-center text-sm font-semibold tabular-nums"
              style={{ background: c2?.bg, color: c2?.fg }}
            >
              {v2 === "#" ? (
                <span className="font-mono text-muted-foreground">#</span>
              ) : (
                formatNumber(v2 ?? "")
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
