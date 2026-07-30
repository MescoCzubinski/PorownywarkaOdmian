import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Scale } from "lucide-react";

import { getOrderedTraits, type CropSchema } from "@/utils/loadData";
import type { VarietyRow } from "@/App";
import { getIcon } from "@/utils/icons";
import { formatNumber, formatUnit } from "@/utils/format";
import { Modal, ModalHeader, ModalTitle } from "@/components/Modal";
import { Button } from "@/ui/button";
import { cn } from "@/utils/utils";

const SWIPE_THRESHOLD_PX = 50;
const DESKTOP_WINDOW_SIZE = 5;

interface SwipeWindowProps {
  rows: VarietyRow[];
  pairStart: number;
  dragOffsetPx: number;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  renderItem: (row: VarietyRow, index: number) => React.ReactNode;
}

function SwipeWindow({
  rows,
  pairStart,
  dragOffsetPx,
  isDragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  renderItem,
}: SwipeWindowProps) {
  return (
    <div
      className="touch-pan-y overflow-hidden select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className="flex"
        style={{
          width: `${(rows.length / 2) * 100}%`,
          transform: `translateX(calc(${-pairStart * (100 / rows.length)}% + ${
            isDragging ? dragOffsetPx : 0
          }px))`,
          transition: isDragging ? "none" : "transform 200ms ease-out",
        }}
      >
        {rows.map((row, i) => (
          <div
            key={row.name}
            style={{ width: `${100 / rows.length}%` }}
            className="shrink-0"
          >
            {renderItem(row, i)}
          </div>
        ))}
      </div>
    </div>
  );
}

interface CompareModalProps {
  open: boolean;
  onClose: () => void;
  schema: CropSchema;
  rows: VarietyRow[];
}

export function CompareModal({
  open,
  onClose,
  schema,
  rows,
}: CompareModalProps) {
  const traits = getOrderedTraits(schema);
  const canCompare = rows.length >= 2;

  const maxPairStart = Math.max(0, rows.length - 2);
  const [pairStart, setPairStart] = useState(0);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const clampedPairStart = Math.min(pairStart, maxPairStart);

  const maxDesktopStart = Math.max(0, rows.length - DESKTOP_WINDOW_SIZE);
  const [desktopStart, setDesktopStart] = useState(0);
  const clampedDesktopStart = Math.min(desktopStart, maxDesktopStart);
  const visibleCount = Math.min(DESKTOP_WINDOW_SIZE, rows.length);
  const visibleIndices = Array.from(
    { length: visibleCount },
    (_, i) => clampedDesktopStart + i,
  );

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartX.current = e.clientX;
    setIsDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    setDragOffsetPx(e.clientX - dragStartX.current);
  }

  function handlePointerUp() {
    if (!isDragging) return;
    if (dragOffsetPx <= -SWIPE_THRESHOLD_PX) {
      setPairStart(Math.min(maxPairStart, clampedPairStart + 1));
    } else if (dragOffsetPx >= SWIPE_THRESHOLD_PX) {
      setPairStart(Math.max(0, clampedPairStart - 1));
    }
    setIsDragging(false);
    setDragOffsetPx(0);
  }

  return (
    <Modal open={open} onClose={onClose} width="wide">
      <ModalHeader onClose={onClose}>
        <Scale className="size-4 text-brand" />
        <ModalTitle className="text-base font-bold">
          Porównanie odmian
        </ModalTitle>
      </ModalHeader>

      {!canCompare ? (
        <div className="flex flex-col items-center gap-3 px-8 py-12 text-center text-muted-foreground">
          <Scale className="size-8" />
          <div className="text-base text-foreground">
            Zaznacz co najmniej 2 odmiany
          </div>
          <div className="text-sm">
            Użyj checkboxów w tabeli, aby dodać odmiany do porównania.
          </div>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-auto">
            <div
              role="table"
              aria-label="Porównanie odmian"
              className="hidden min-w-full sm:grid"
              style={{
                gridTemplateColumns: `minmax(160px,1.4fr) repeat(${visibleCount}, minmax(85px,1fr))`,
              }}
            >
              <div role="row" style={{ display: "contents" }}>
                <div
                  role="columnheader"
                  className="border-r-2 border-b-2 border-border bg-muted px-3.5 py-3 text-sm text-muted-foreground"
                >
                  Cecha
                </div>
                {visibleIndices.map((i) => (
                  <div
                    key={rows[i].name}
                    role="columnheader"
                    className="truncate border-b-2 border-border px-3.5 py-3 text-center text-sm font-bold"
                  >
                    {rows[i].name}
                  </div>
                ))}
              </div>
              {traits.map((trait) => {
                const Icon = getIcon(trait.icon);
                const values = rows.map(
                  (row) => row.primary[trait.key] ?? row.secondary[trait.key],
                );
                const numeric = values.map((v) => Number(v));
                const best =
                  trait.type === "number"
                    ? Math.max(...numeric.filter((n) => !Number.isNaN(n)))
                    : null;
                return (
                  <div key={trait.key} role="row" style={{ display: "contents" }}>
                    <div
                      role="rowheader"
                      className="flex items-center gap-2 border-r-2 border-b border-border bg-background px-3.5 py-2.5 text-sm"
                    >
                      {Icon && (
                        <Icon className="size-3.5 text-muted-foreground" />
                      )}
                      {trait.name}
                    </div>
                    {visibleIndices.map((i) => {
                      const value = values[i];
                      const isBest = best !== null && numeric[i] === best;
                      return (
                        <div
                          key={rows[i].name}
                          role="cell"
                          className={cn(
                            "flex items-center justify-center border-b border-border px-3.5 py-2.5 text-sm tabular-nums",
                            isBest
                              ? "bg-brand/10 font-bold text-brand"
                              : "font-medium",
                          )}
                        >
                          {value !== undefined ? formatNumber(value) : ""}
                          <span className="text-xs font-normal text-muted-foreground">
                            {formatUnit(trait.unit)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div
              className="sm:hidden"
              role="region"
              aria-label="Porównanie odmian"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  setPairStart(Math.max(0, clampedPairStart - 1));
                } else if (e.key === "ArrowRight") {
                  e.preventDefault();
                  setPairStart(Math.min(maxPairStart, clampedPairStart + 1));
                }
              }}
            >
              <div className="border-b border-border bg-muted py-2 text-center text-sm font-bold">
                Odmiana:
              </div>
              <div className="border-b border-border">
                <SwipeWindow
                  rows={rows}
                  pairStart={clampedPairStart}
                  dragOffsetPx={dragOffsetPx}
                  isDragging={isDragging}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  renderItem={(row) => (
                    <div className="px-1.5 py-2 text-center text-sm font-semibold shadow-[inset_-1px_0_0_0_var(--border)]">
                      {row.name}
                    </div>
                  )}
                />
              </div>
              {traits.map((trait) => {
                const values = rows.map(
                  (row) => row.primary[trait.key] ?? row.secondary[trait.key],
                );
                const numeric = values.map((v) => Number(v));
                const best =
                  trait.type === "number"
                    ? Math.max(...numeric.filter((n) => !Number.isNaN(n)))
                    : null;
                return (
                  <div key={trait.key}>
                    <div className="bg-muted px-2 py-2 text-center text-xs font-bold">
                      {trait.name}
                    </div>
                    <div className="border-b border-border">
                      <SwipeWindow
                        rows={rows}
                        pairStart={clampedPairStart}
                        dragOffsetPx={dragOffsetPx}
                        isDragging={isDragging}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        renderItem={(_row, i) => {
                          const value = values[i];
                          const isBest = best !== null && numeric[i] === best;
                          return (
                            <div
                              className={cn(
                                "flex items-center justify-center px-1.5 py-2 text-sm tabular-nums shadow-[inset_-1px_0_0_0_var(--border)]",
                                isBest
                                  ? "bg-brand/10 font-bold text-brand"
                                  : "font-medium",
                              )}
                            >
                              <span className="truncate">
                                {value !== undefined ? formatNumber(value) : ""}
                                <span className="text-xs font-normal text-muted-foreground">
                                  {formatUnit(trait.unit)}
                                </span>
                              </span>
                            </div>
                          );
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {rows.length > DESKTOP_WINDOW_SIZE && (
            <div className="hidden items-center justify-end gap-1 border-t border-border px-3.5 py-1.5 sm:flex">
              <span className="mr-auto text-xs text-muted-foreground">
                {clampedDesktopStart + 1}–{clampedDesktopStart + visibleCount} z{" "}
                {rows.length} odmian
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Poprzednie odmiany"
                onClick={() =>
                  setDesktopStart(Math.max(0, clampedDesktopStart - 1))
                }
                disabled={clampedDesktopStart === 0}
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Następne odmiany"
                onClick={() =>
                  setDesktopStart(
                    Math.min(maxDesktopStart, clampedDesktopStart + 1),
                  )
                }
                disabled={clampedDesktopStart === maxDesktopStart}
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
