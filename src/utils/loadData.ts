export interface TraitDefinition {
  name: string;
  unit: string;
  type: "string" | "number" | "label";
  icon?: string;
  sortGroup?: "basic" | "extra";
  detailGroup?: string;
  order?: number;
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

export interface SpeciesCategory {
  id: string;
  name: string;
}

export interface SpeciesDefinition {
  id: string;
  name: string;
  category: string;
  icon: string;
  dataFile: string | null;
}

export interface SpeciesManifest {
  categories: SpeciesCategory[];
  species: SpeciesDefinition[];
}

export interface ResolvedTrait extends TraitDefinition {
  key: string;
  value: string;
}

export type Crop = string;

let manifestPromise: Promise<SpeciesManifest> | undefined;

export function loadSpeciesManifest(): Promise<SpeciesManifest> {
  if (!manifestPromise) {
    manifestPromise = fetch(`${import.meta.env.BASE_URL}data/species.json`).then(
      (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load species manifest (${res.status})`);
        }
        return res.json() as Promise<SpeciesManifest>;
      },
    );
  }

  return manifestPromise;
}

const NO_DATA = "#";

function normalizeYearEntry(entry: YearEntry): YearEntry {
  const trim = (row: Record<string, string>) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, value.trim()]),
    );

  return {
    primary_traits: trim(entry.primary_traits),
    secondary_traits: trim(entry.secondary_traits),
    regional_yields: entry.regional_yields,
  };
}

function normalizeDataset(dataset: CropDataset): CropDataset {
  for (const entry of Object.values(dataset.odmiany)) {
    delete entry.years[NO_DATA];
    for (const [year, yearEntry] of Object.entries(entry.years)) {
      entry.years[year] = normalizeYearEntry(yearEntry);
    }
  }

  return dataset;
}

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
    ).then(normalizeDataset);
    cache.set(crop, dataset);
  }

  return dataset;
}

export function getLatestYear(entry: VarietyEntry): string | undefined {
  const years = Object.keys(entry.years);
  if (years.length === 0) return undefined;
  return years.reduce((latest, year) => (year > latest ? year : latest));
}

export interface RecommendedRegion {
  registered: boolean;
  year: number | null;
  preliminary: boolean;
}

export function parseRecommendedRegion(raw: string): RecommendedRegion {
  if (raw === "-") {
    return { registered: false, year: null, preliminary: false };
  }

  const preliminary = raw.endsWith("R");
  const year = Number(preliminary ? raw.slice(0, -1) : raw);

  return { registered: true, year, preliminary };
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

export interface TraitHistoryPoint {
  year: number;
  value: string;
}

export async function loadTraitHistory(
  crop: Crop,
  varietyName: string,
  trait: string,
): Promise<TraitHistoryPoint[]> {
  const { schema, odmiany } = await loadCropData(crop);
  const entry = odmiany[varietyName];
  if (!entry) return [];

  const group =
    trait in schema.primary_traits ? "primary_traits" : "secondary_traits";

  const points = Object.entries(entry.years)
    .map(([year, yearEntry]) => ({
      year: Number(year),
      value: yearEntry[group][trait],
    }))
    .sort((a, b) => a.year - b.year);

  return points.slice(-6);
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
