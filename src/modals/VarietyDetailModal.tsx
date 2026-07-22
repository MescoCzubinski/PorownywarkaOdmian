import type { Dispatch } from "react";

import {
  ChevronRight,
  Grid3x3,
  List,
  Map as MapIcon,
  Scale,
} from "lucide-react";

import {
  getLatestYear,
  getOrderedTraits,
  type Crop,
  type CropSchema,
  type VarietyEntry,
} from "@/utils/loadData";
import type { AppAction, AppState } from "@/hooks/useAction";
import { getIcon } from "@/utils/icons";
import { formatNumber, formatUnit } from "@/utils/format";
import { Button } from "@/ui/button";
import { Modal, ModalHeader, ModalTitle } from "@/components/Modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { TraitChart } from "@/components/TraitChart";
import { RegionalYieldsHeatmap } from "@/components/RegionalYieldsHeatmap";
import { RecommendedRegionsMap } from "@/components/RecommendedRegionsMap";

interface VarietyDetailModalProps {
  open: boolean;
  onClose: () => void;
  crop: Crop;
  schema: CropSchema;
  entry: VarietyEntry | undefined;
  varietyName: string | null;
  state: Pick<
    AppState,
    "detailTab" | "chartTraitKey" | "yearFilter" | "selected"
  >;
  dispatch: Dispatch<AppAction>;
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

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader
        onClose={onClose}
        actions={
          <Button
            variant={isSelected ? "brand" : "outline"}
            size="icon"
            aria-label={
              isSelected ? "Usuń z porównania" : "Dodaj do porównania"
            }
            onClick={() =>
              varietyName &&
              dispatch({ type: "TOGGLE_VARIETY", variety: varietyName })
            }
          >
            <Scale
              className={
                "size-5 " +
                (isSelected ? "text-brand-foreground" : "text-muted-foreground")
              }
            />
          </Button>
        }
      >
        <div className="min-w-0 flex-1">
          <ModalTitle className="text-lg font-bold">{varietyName}</ModalTitle>
          {year && (
            <p className="mt-1 text-xs text-muted-foreground">
              Dane z {year} r. (zbiory {Number(year) - 1} r.)
            </p>
          )}
        </div>
      </ModalHeader>

      <Tabs
        className="min-h-0 flex-1"
        value={state.detailTab}
        onValueChange={(tab) =>
          dispatch({
            type: "SET_DETAIL_TAB",
            tab: tab as AppState["detailTab"],
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
            const expanded = chartable && state.chartTraitKey === trait.key;
            return (
              <div key={trait.key} className="border-b border-border">
                <div
                  onClick={() =>
                    chartable &&
                    dispatch(
                      expanded
                        ? { type: "CLOSE_CHART" }
                        : { type: "OPEN_CHART", traitKey: trait.key },
                    )
                  }
                  {...(chartable
                    ? {
                        role: "button",
                        tabIndex: 0,
                        "aria-expanded": expanded,
                        onKeyDown: (e: React.KeyboardEvent) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            dispatch(
                              expanded
                                ? { type: "CLOSE_CHART" }
                                : { type: "OPEN_CHART", traitKey: trait.key },
                            );
                          }
                        },
                      }
                    : {})}
                  className={
                    "flex items-center gap-2.5 px-4 py-2.5 " +
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
                    <ChevronRight
                      className={
                        "size-3.5 shrink-0 text-muted-foreground transition-transform " +
                        (expanded ? "rotate-90" : "")
                      }
                    />
                  )}
                </div>
                {expanded && varietyName && (
                  <div className="border-t border-border bg-muted/30">
                    <TraitChart
                      crop={crop}
                      varietyName={varietyName}
                      traitKey={trait.key}
                      traitName={trait.name}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="rejony" className="overflow-y-auto p-4">
          <RegionalYieldsHeatmap
            regionSchema={schema.regional_yields}
            regionalYields={regionalYields}
          />
        </TabsContent>

        <TabsContent value="mapa" className="overflow-y-auto p-4">
          <RecommendedRegionsMap
            regionSchema={schema.recommended_regions}
            recommendedRegions={entry?.recommended_regions ?? {}}
          />
        </TabsContent>
      </Tabs>
    </Modal>
  );
}
