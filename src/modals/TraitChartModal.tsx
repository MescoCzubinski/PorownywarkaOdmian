import { Suspense, use } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { loadTraitHistory, type TraitHistoryPoint } from "@/utils/loadData";
import { formatNumber } from "@/utils/format";
import { Modal, ModalHeader } from "@/components/Modal";

const X0 = 40;
const X1 = 322;
const Y_TOP = 20;
const Y_BOTTOM = 124;
const PLOT_HEIGHT = Y_BOTTOM - Y_TOP;

function tickY(value: number, min: number, max: number) {
  const t = max > min ? (value - min) / (max - min) : 0.5;
  return Y_BOTTOM - t * PLOT_HEIGHT;
}

function TraitChart({ points }: { points: TraitHistoryPoint[] }) {
  const values = points.map((p) => Number(p.value));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const n = points.length;

  const dots = points.map((_, i) => {
    const x = n > 1 ? X0 + (i / (n - 1)) * (X1 - X0) : (X0 + X1) / 2;
    return { x, y: tickY(values[i], min, max) };
  });
  const linePoints = dots.map((d) => `${d.x},${d.y}`).join(" ");

  const yTicks = max > min ? [min, (min + max) / 2, max] : [min];

  return (
    <div className="p-4">
      <svg viewBox="0 0 340 150" className="block h-auto w-full">
        <line
          x1={X0}
          y1={Y_TOP}
          x2={X0}
          y2={Y_BOTTOM}
          style={{ stroke: "var(--border)" }}
        />
        <line
          x1={X0}
          y1={Y_BOTTOM}
          x2={X1}
          y2={Y_BOTTOM}
          style={{ stroke: "var(--muted-foreground)" }}
          strokeWidth={1.5}
        />
        {yTicks.map((value) => {
          const y = tickY(value, min, max);
          return (
            <g key={value}>
              {value !== min && (
                <line
                  x1={X0}
                  y1={y}
                  x2={X1}
                  y2={y}
                  style={{ stroke: "var(--border)" }}
                  strokeOpacity={0.6}
                />
              )}
              <text
                x={X0 - 6}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={9}
                style={{ fill: "var(--muted-foreground)" }}
              >
                {formatNumber(value.toFixed(1))}
              </text>
            </g>
          );
        })}
        {n > 1 && (
          <polyline
            fill="none"
            style={{ stroke: "var(--brand)" }}
            strokeWidth={2.5}
            points={linePoints}
          />
        )}
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={3.6}
            style={{ fill: "var(--background)", stroke: "var(--brand)" }}
            strokeWidth={2}
          />
        ))}
      </svg>
      <div className="mt-1.5 flex">
        {points.map((p) => (
          <span
            key={p.year}
            className="flex-1 text-center text-xs tabular-nums text-muted-foreground"
          >
            {p.year}
          </span>
        ))}
      </div>
    </div>
  );
}

interface TraitChartLoaderProps {
  crop: string;
  varietyName: string;
  traitKey: string;
}

function TraitChartLoader({
  crop,
  varietyName,
  traitKey,
}: TraitChartLoaderProps) {
  const points = use(loadTraitHistory(crop, varietyName, traitKey));
  return <TraitChart points={points} />;
}

interface TraitChartModalProps {
  open: boolean;
  onClose: () => void;
  crop: string;
  varietyName: string | null;
  traitKey: string | null;
  label: string;
}

export function TraitChartModal({
  open,
  onClose,
  crop,
  varietyName,
  traitKey,
  label,
}: TraitChartModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        <DialogPrimitive.Title className="text-base font-bold">
          {label}
        </DialogPrimitive.Title>
      </ModalHeader>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {varietyName && traitKey && (
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Ładowanie…
              </div>
            }
          >
            <TraitChartLoader
              crop={crop}
              varietyName={varietyName}
              traitKey={traitKey}
            />
          </Suspense>
        )}
      </div>
    </Modal>
  );
}
