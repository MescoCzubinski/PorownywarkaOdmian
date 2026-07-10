export interface TraitDefinition {
  name: string;
  unit: string;
  type: "string" | "number" | "label";
  icon?: string;
}

export type TraitGroup = Record<string, TraitDefinition>;

export interface CropSchema {
  primary_traits: TraitGroup;
  secondary_traits: TraitGroup;
  regional_yields: TraitGroup;
  recommended_regions: TraitGroup;
}

export interface YearEntry {
  primary_traits: Record<string, string>;
  secondary_traits: Record<string, string>;
  regional_yields: Record<string, string>;
}

export interface VarietyEntry {
  years: Record<string, YearEntry>;
  recommended_regions: Record<string, string>;
}

export interface CropDataset {
  schema: CropSchema;
  odmiany: Record<string, VarietyEntry>;
}

export const CROPS = {
  pszenica_jara: "Pszenica jara",
} as const;

export interface ResolvedTrait extends TraitDefinition {
  key: string;
  value: string;
}

export type Crop = keyof typeof CROPS;

const cache = new Map<Crop, Promise<CropDataset>>();

export function loadCropData(crop: Crop): Promise<CropDataset> {
  let dataset = cache.get(crop);

  if (!dataset) {
    dataset = fetch(`${import.meta.env.BASE_URL}data/${crop}.json`).then(
      (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load "${crop}" dataset (${res.status})`);
        }
        return res.json() as Promise<CropDataset>;
      },
    );
    cache.set(crop, dataset);
  }

  return dataset;
}

function resolveTraits(
  group: TraitGroup,
  row: Record<string, string>,
): ResolvedTrait[] {
  return Object.entries(row).map(([key, value]) => ({
    key,
    value,
    ...group[key],
  }));
}

export async function loadPrimaryTraits(crop: Crop, year: string) {
  const { schema, odmiany } = await loadCropData(crop);
  return Object.fromEntries(
    Object.entries(odmiany).map(([variety, entry]) => [
      variety,
      resolveTraits(
        schema.primary_traits,
        entry.years[year]?.primary_traits ?? {},
      ),
    ]),
  );
}

export async function loadAllTraits(crop: Crop, year: string) {
  const { schema, odmiany } = await loadCropData(crop);
  return Object.fromEntries(
    Object.entries(odmiany).map(([variety, entry]) => [
      variety,
      [
        ...resolveTraits(
          schema.primary_traits,
          entry.years[year]?.primary_traits ?? {},
        ),
        ...resolveTraits(
          schema.secondary_traits,
          entry.years[year]?.secondary_traits ?? {},
        ),
      ],
    ]),
  );
}

export async function loadRegionalYields(crop: Crop, year: string) {
  const { schema, odmiany } = await loadCropData(crop);
  return Object.fromEntries(
    Object.entries(odmiany).map(([variety, entry]) => [
      variety,
      resolveTraits(
        schema.regional_yields,
        entry.years[year]?.regional_yields ?? {},
      ),
    ]),
  );
}

export async function loadRecommendedRegions(crop: Crop) {
  const { schema, odmiany } = await loadCropData(crop);
  return Object.fromEntries(
    Object.entries(odmiany).map(([variety, entry]) => [
      variety,
      resolveTraits(schema.recommended_regions, entry.recommended_regions),
    ]),
  );
}

export async function loadTrait(crop: Crop, trait: string) {
  const { schema, odmiany } = await loadCropData(crop);
  const group =
    trait in schema.primary_traits
      ? "primary_traits"
      : trait in schema.secondary_traits
        ? "secondary_traits"
        : "regional_yields";

  return Object.fromEntries(
    Object.entries(odmiany).map(([variety, entry]) => [
      variety,
      Object.fromEntries(
        Object.entries(entry.years).map(([year, yearEntry]) => [
          year,
          yearEntry[group][trait],
        ]),
      ),
    ]),
  );
}
