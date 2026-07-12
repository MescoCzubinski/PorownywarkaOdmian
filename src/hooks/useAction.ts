import { useReducer } from "react";

export type DetailTab = "cechy" | "rejony" | "mapa";
export type ActiveModal =
  | "legend"
  | "sort"
  | "filters"
  | "detail"
  | "compare"
  | null;
export type SortDir = "asc" | "desc";

export interface AppState {
  species: string | null;
  selected: Set<string>;
  sortKey: string;
  sortDir: SortDir;
  extraCol: string | null;
  search: string;
  labelFilters: Record<string, string>;
  regionFilter: string;
  yearFilter: string;
  page: number;
  activeModal: ActiveModal;
  detailVariety: string | null;
  detailTab: DetailTab;
  chartTraitKey: string | null;
}

export type AppAction =
  | { type: "SELECT_SPECIES"; species: string }
  | { type: "TOGGLE_VARIETY"; variety: string }
  | { type: "TOGGLE_ALL_ON_PAGE"; varieties: string[] }
  | { type: "SET_SORT"; key: string; isExtra: boolean }
  | { type: "SET_SEARCH"; value: string }
  | { type: "SET_LABEL_FILTER"; key: string; value: string }
  | { type: "SET_REGION_FILTER"; value: string }
  | { type: "SET_YEAR_FILTER"; value: string }
  | { type: "SET_PAGE"; page: number }
  | { type: "OPEN_MODAL"; modal: Exclude<ActiveModal, null | "detail"> }
  | { type: "CLOSE_MODAL" }
  | { type: "OPEN_DETAIL"; variety: string }
  | { type: "SET_DETAIL_TAB"; tab: DetailTab }
  | { type: "OPEN_CHART"; traitKey: string }
  | { type: "CLOSE_CHART" }
  | { type: "BACK_TO_SPECIES" };

export const initialAppState: AppState = {
  species: null,
  selected: new Set(),
  sortKey: "name",
  sortDir: "asc",
  extraCol: null,
  search: "",
  labelFilters: {},
  regionFilter: "",
  yearFilter: "",
  page: 0,
  activeModal: null,
  detailVariety: null,
  detailTab: "cechy",
  chartTraitKey: null,
};

function appReducer(
  state: AppState,
  action: AppAction,
): AppState {
  switch (action.type) {
    case "SELECT_SPECIES":
      return { ...initialAppState, species: action.species };

    case "TOGGLE_VARIETY": {
      const selected = new Set(state.selected);
      if (selected.has(action.variety)) {
        selected.delete(action.variety);
      } else {
        selected.add(action.variety);
      }
      return { ...state, selected };
    }

    case "TOGGLE_ALL_ON_PAGE": {
      const allSelected = action.varieties.every((v) => state.selected.has(v));
      const selected = new Set(state.selected);
      for (const variety of action.varieties) {
        if (allSelected) {
          selected.delete(variety);
        } else {
          selected.add(variety);
        }
      }
      return { ...state, selected };
    }

    case "SET_SORT": {
      const sortDir: SortDir =
        state.sortKey === action.key
          ? state.sortDir === "asc"
            ? "desc"
            : "asc"
          : action.isExtra
            ? "desc"
            : "asc";
      return {
        ...state,
        sortKey: action.key,
        sortDir,
        extraCol: action.isExtra ? action.key : null,
      };
    }

    case "SET_SEARCH":
      return { ...state, search: action.value, page: 0 };

    case "SET_LABEL_FILTER":
      return {
        ...state,
        labelFilters: { ...state.labelFilters, [action.key]: action.value },
        page: 0,
      };

    case "SET_REGION_FILTER":
      return { ...state, regionFilter: action.value, page: 0 };

    case "SET_YEAR_FILTER":
      return { ...state, yearFilter: action.value, page: 0 };

    case "SET_PAGE":
      return { ...state, page: action.page };

    case "OPEN_MODAL":
      return { ...state, activeModal: action.modal };

    case "CLOSE_MODAL":
      return { ...state, activeModal: null };

    case "OPEN_DETAIL":
      return {
        ...state,
        activeModal: "detail",
        detailVariety: action.variety,
        detailTab: "cechy",
        chartTraitKey: null,
      };

    case "SET_DETAIL_TAB":
      return { ...state, detailTab: action.tab, chartTraitKey: null };

    case "OPEN_CHART":
      return { ...state, chartTraitKey: action.traitKey };

    case "CLOSE_CHART":
      return { ...state, chartTraitKey: null };

    case "BACK_TO_SPECIES":
      return { ...initialAppState };

    default:
      return state;
  }
}

export function useAction() {
  return useReducer(appReducer, initialAppState);
}
