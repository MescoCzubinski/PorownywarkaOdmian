import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  ChevronRight,
  Grid3x3,
  List,
  Map as MapIcon,
  Scale,
  X,
} from "lucide-react";

import {
  getLatestYear,
  parseRecommendedRegion,
  type CropSchema,
  type VarietyEntry,
} from "@/utils/loadData";
import type { ComparerAction, ComparerState } from "@/hooks/useComparer";
import { getOrderedTraits } from "@/utils/traits";
import { getIcon } from "@/utils/icons";
import { formatNumber, formatUnit } from "@/utils/format";
import { Button } from "@/ui/button";
import { Modal } from "@/components/Modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { TraitChartModal } from "@/modals/TraitChartModal";

const REGIONS = ["I", "II", "III", "IV", "V", "VI"];

function regionColor(value: number, min: number, max: number) {
  const t = max > min ? (value - min) / (max - min) : 0.5;
  const light = 95 - t * 56;
  return {
    bg: `hsl(150 55% ${light}%)`,
    fg: t > 0.62 ? "var(--background)" : "var(--foreground)",
  };
}

interface VarietyDetailModalProps {
  open: boolean;
  onClose: () => void;
  crop: string;
  schema: CropSchema;
  entry: VarietyEntry | undefined;
  varietyName: string | null;
  state: Pick<
    ComparerState,
    "detailTab" | "chartTraitKey" | "yearFilter" | "selected"
  >;
  dispatch: React.Dispatch<ComparerAction>;
}

export function VarietyDetailModal({
  open,
  onClose,
  crop,
  schema,
  entry,
  varietyName,
  state,
  dispatch,
}: VarietyDetailModalProps) {
  const isSelected = varietyName ? state.selected.has(varietyName) : false;
  const year = entry
    ? state.yearFilter && entry.years[state.yearFilter]
      ? state.yearFilter
      : getLatestYear(entry)
    : undefined;
  const yearData = year && entry ? entry.years[year] : undefined;
  const primary = yearData?.primary_traits ?? {};
  const secondary = yearData?.secondary_traits ?? {};

  const traits = getOrderedTraits(schema);
  const hasMultipleYears = entry ? Object.keys(entry.years).length > 1 : false;

  const regionalYields = yearData?.regional_yields ?? {};
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
  const hasRecommendedRegions = Object.values(
    entry?.recommended_regions ?? {},
  ).some((v) => v !== "-");

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <div className="min-w-0 flex-1">
            <DialogPrimitive.Title className="text-lg font-bold">
              {varietyName}
            </DialogPrimitive.Title>
            {year && (
              <p className="mt-1 text-xs text-muted-foreground">
                Dane za {year} r.
              </p>
            )}
          </div>
          <Button
            variant={isSelected ? "brand" : "outline"}
            size="icon"
            onClick={() =>
              varietyName &&
              dispatch({ type: "TOGGLE_VARIETY", variety: varietyName })
            }
          >
            <Scale className="size-5 text-muted-foreground" />
          </Button>
          <Button variant="outline" size="icon" onClick={onClose}>
            <X className="size-5 text-muted-foreground" />
          </Button>
        </div>

        <Tabs
          className="min-h-0 flex-1"
          value={state.detailTab}
          onValueChange={(tab) =>
            dispatch({
              type: "SET_DETAIL_TAB",
              tab: tab as ComparerState["detailTab"],
            })
          }
        >
          <div className="p-3">
            <TabsList>
              <TabsTrigger value="cechy">
                <List className="size-3.5" />
                Cechy
              </TabsTrigger>
              <TabsTrigger value="rejony">
                <Grid3x3 className="size-3.5" />
                Plony
              </TabsTrigger>
              <TabsTrigger value="mapa">
                <MapIcon className="size-3.5" />
                LOZ
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="cechy" className="overflow-y-auto">
            {traits.map((trait) => {
              const raw = primary[trait.key] ?? secondary[trait.key];
              const Icon = getIcon(trait.icon);
              const chartable = trait.type === "number" && hasMultipleYears;
              return (
                <div
                  key={trait.key}
                  onClick={() =>
                    chartable &&
                    dispatch({ type: "OPEN_CHART", traitKey: trait.key })
                  }
                  className={
                    "flex items-center gap-2.5 border-b border-border px-4 py-2.5 " +
                    (chartable ? "cursor-pointer hover:bg-muted" : "")
                  }
                >
                  {Icon && (
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="text-sm">{trait.name}</span>
                  <span className="ml-auto text-sm font-semibold tabular-nums">
                    {raw !== undefined ? formatNumber(raw) : ""}
                    <span className="font-normal text-muted-foreground">
                      {formatUnit(trait.unit)}
                    </span>
                  </span>
                  {chartable && (
                    <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="rejony" className="overflow-y-auto p-4">
            {!hasRegionalYields ? (
              <div className="flex h-full items-center justify-center text-center text-md text-muted-foreground">
                Brak danych dla tej odmiany
              </div>
            ) : (
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
                          <span className="font-mono text-muted-foreground">
                            #
                          </span>
                        ) : (
                          formatNumber(v1 ?? "")
                        )}
                      </div>
                      <div
                        className="rounded-md py-2 text-center text-sm font-semibold tabular-nums"
                        style={{ background: c2?.bg, color: c2?.fg }}
                      >
                        {v2 === "#" ? (
                          <span className="font-mono text-muted-foreground">
                            #
                          </span>
                        ) : (
                          formatNumber(v2 ?? "")
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </TabsContent>

          <TabsContent value="mapa" className="overflow-y-auto p-4">
            {!hasRecommendedRegions ? (
              <div className="flex h-full items-center justify-center text-center text-md text-muted-foreground">
                Brak danych dla tej odmiany
              </div>
            ) : (
              <div className="mt-3.5 grid grid-cols-4 gap-1.5">
                {Object.entries(schema.recommended_regions).map(
                  ([key, def]) => {
                    const raw = entry?.recommended_regions[key];
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
                            (parsed?.registered
                              ? "text-brand"
                              : "text-muted-foreground")
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
                  },
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Modal>

      <TraitChartModal
        open={!!state.chartTraitKey}
        onClose={() => dispatch({ type: "CLOSE_CHART" })}
        crop={crop}
        varietyName={varietyName}
        traitKey={state.chartTraitKey}
        label={traits.find((t) => t.key === state.chartTraitKey)?.name ?? ""}
      />
    </>
  );
}
