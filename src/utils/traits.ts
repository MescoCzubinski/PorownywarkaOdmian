import type { CropSchema, TraitDefinition } from "@/utils/loadData";

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
