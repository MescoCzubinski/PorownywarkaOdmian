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

export interface Trait extends TraitDefinition {
  key: string;
}

export function getOrderedTraits(schema: CropSchema): Trait[] {
  return [
    ...Object.entries(schema.primary_traits),
    ...Object.entries(schema.secondary_traits),
  ].map(([key, def]) => ({ key, ...def }));
}

export function getPrimaryTraits(schema: CropSchema): Trait[] {
  return Object.entries(schema.primary_traits).map(([key, def]) => ({
    key,
    ...def,
  }));
}

export function getLabelTraits(schema: CropSchema): Trait[] {
  return getOrderedTraits(schema).filter((trait) => trait.type === "label");
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
  dataFile: string | null;
}

export interface SpeciesManifest {
  categories: SpeciesCategory[];
  species: SpeciesDefinition[];
}

export type Crop = string;

let manifestPromise: Promise<SpeciesManifest> | undefined;

export function loadSpeciesManifest(): Promise<SpeciesManifest> {
  if (!manifestPromise) {
    manifestPromise = fetch(
      `${import.meta.env.BASE_URL}data/species.json`,
    ).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to load species manifest (${res.status})`);
      }
      return res.json() as Promise<SpeciesManifest>;
    });
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
    dataset = loadSpeciesManifest()
      .then((manifest) => {
        const species = manifest.species.find((s) => s.id === crop)!;
        return fetch(`${import.meta.env.BASE_URL}data/${species.dataFile}`);
      })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load "${crop}" dataset (${res.status})`);
        }
        return res.json() as Promise<CropDataset>;
      })
      .then(normalizeDataset);
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

  return Object.entries(entry.years)
    .map(([year, yearEntry]) => ({
      year: Number(year),
      value: yearEntry[group][trait],
    }))
    .sort((a, b) => a.year - b.year);
}
