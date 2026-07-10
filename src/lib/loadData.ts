export interface TraitDefinition {
  name: string;
  unit: string;
  type: "string" | "number" | "label";
}

export type TraitGroup = Record<string, TraitDefinition>;

export interface CropSchema {
  primary_traits: TraitGroup;
  secondary_traits: TraitGroup;
  regional_yields: TraitGroup;
  recommended_regions: TraitGroup;
}

export interface VarietyEntry {
  primary_traits: Record<string, string>[];
  secondary_traits: Record<string, string>[];
  regional_yields: Record<string, string>[];
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

export async function loadPrimaryTraits(crop: Crop) {
  const { schema, odmiany } = await loadCropData(crop);
  return Object.fromEntries(
    Object.entries(odmiany).map(([variety, entry]) => [
      variety,
      entry.primary_traits.map((row) =>
        resolveTraits(schema.primary_traits, row),
      ),
    ]),
  );
}

export async function loadAllTraits(crop: Crop) {
  const { schema, odmiany } = await loadCropData(crop);
  return Object.fromEntries(
    Object.entries(odmiany).map(([variety, entry]) => [
      variety,
      entry.primary_traits.map((row, i) => [
        ...resolveTraits(schema.primary_traits, row),
        ...resolveTraits(
          schema.secondary_traits,
          entry.secondary_traits[i] ?? {},
        ),
      ]),
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
      entry[group].map((row, i) => ({
        year: entry.primary_traits[i]?.rok_wynikow,
        value: row[trait],
      })),
    ]),
  );
}

export async function loadRegionalYields(crop: Crop) {
  const { schema, odmiany } = await loadCropData(crop);
  return Object.fromEntries(
    Object.entries(odmiany).map(([variety, entry]) => [
      variety,
      entry.regional_yields.map((row) =>
        resolveTraits(schema.regional_yields, row),
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
