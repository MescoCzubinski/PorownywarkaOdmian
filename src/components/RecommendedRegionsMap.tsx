import { parseRecommendedRegion, type TraitGroup } from "@/utils/loadData";

interface RecommendedRegionsMapProps {
  regionSchema: TraitGroup;
  recommendedRegions: Record<string, string>;
}

export function RecommendedRegionsMap({
  regionSchema,
  recommendedRegions,
}: RecommendedRegionsMapProps) {
  const hasRecommendedRegions = Object.values(recommendedRegions).some(
    (v) => v !== "-",
  );

  if (!hasRecommendedRegions) {
    return (
      <div className="flex h-full items-center justify-center text-center text-md text-muted-foreground">
        Brak danych dla tej odmiany
      </div>
    );
  }

  return (
    <div className="mt-3.5 grid grid-cols-4 gap-1.5">
      {Object.entries(regionSchema).map(([key, def]) => {
        const raw = recommendedRegions[key];
        const parsed = raw ? parseRecommendedRegion(raw) : null;
        return (
          <div
            key={key}
            className={
              "min-w-0 rounded-md border px-1 py-1.5 text-center " +
              (parsed?.registered
                ? "border-brand bg-brand/10"
                : "border-border bg-muted")
            }
          >
            <div
              className={
                "text-xs leading-tight font-bold wrap-break-word " +
                (parsed?.registered ? "text-brand" : "text-muted-foreground")
              }
            >
              {def.name}
            </div>
            <div className="text-xs tabular-nums text-muted-foreground">
              {parsed?.registered
                ? `${parsed.year}${parsed.preliminary ? " R" : ""}`
                : "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
