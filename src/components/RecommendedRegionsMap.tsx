import { parseRecommendedRegion, type TraitGroup } from "@/utils/loadData";
import { PolandMap, POLAND_REGION_IDS } from "@/components/PolandMap";

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
      <div className="flex h-full pb-4 items-center justify-center text-center text-base text-muted-foreground">
        Brak danych dla tej odmiany
      </div>
    );
  }

  const registeredRegions = POLAND_REGION_IDS.map((id) => {
    const raw = recommendedRegions[id];
    const parsed = raw ? parseRecommendedRegion(raw) : null;
    const name = regionSchema[id]?.name ?? id;
    return { id, name, parsed };
  }).filter(({ parsed }) => parsed?.registered);

  return (
    <>
      <PolandMap
        className="mx-auto w-80"
        regionClassName={(id) => {
          const raw = recommendedRegions[id];
          const parsed = raw ? parseRecommendedRegion(raw) : null;
          return parsed?.registered ? "fill-brand" : "fill-muted";
        }}
        renderTitle={(id) => {
          const raw = recommendedRegions[id];
          const parsed = raw ? parseRecommendedRegion(raw) : null;
          const name = regionSchema[id]?.name ?? id;
          return parsed?.registered
            ? `${name}: ${parsed.year}${parsed.preliminary ? " R" : ""}`
            : name;
        }}
      />
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
        {registeredRegions.map(({ id, name, parsed }) => (
          <li key={id} className="whitespace-nowrap">
            <span className="font-medium">{name}</span>{" "}
            <span className="tabular-nums text-muted-foreground">
              {parsed!.year}
              {parsed!.preliminary ? " R" : ""}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
