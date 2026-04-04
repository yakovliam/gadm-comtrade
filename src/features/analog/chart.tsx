import { useCallback, useMemo, useRef, useState } from "react";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { Group } from "@visx/group";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AnalogChannel {
  label: string;
  unit: string;
  data: Float32Array;
  sampleRate: number;
  color?: string;
}

interface InnerChartProps {
  width: number;
  height: number;
  channels: AnalogChannel[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MARGIN = { top: 12, right: 20, bottom: 26, left: 55 };

const CHANNEL_COLORS = [
  "var(--color-chart-blue1)",
  "var(--color-chart-red1)",
  "var(--color-chart-green1)",
  "var(--color-chart-yellow1)",
  "var(--color-chart-orange1)",
  "var(--color-chart-violet1)",
  "var(--color-chart-pink1)",
  "var(--color-chart-gray1)",
];

const ZOOM_SENSITIVITY = 0.001;
const MIN_DOMAIN_SPAN = 0.0005; // 0.5 ms minimum visible span

// ---------------------------------------------------------------------------
// Axis style tokens — thin, muted grid for an oscilloscope look
// ---------------------------------------------------------------------------

const GRID_STROKE = "rgba(255,255,255,0.07)";
const AXIS_STROKE = "rgba(255,255,255,0.25)";
const TICK_LABEL_COLOR = "rgba(255,255,255,0.55)";
const AXIS_LABEL_COLOR = "rgba(255,255,255,0.7)";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Derive total time span (seconds) from channels. */
function getFullDomain(channels: AnalogChannel[]): [number, number] {
  if (channels.length === 0) return [0, 1];
  let maxTime = 0;
  for (const ch of channels) {
    const t = (ch.data.length - 1) / ch.sampleRate;
    if (t > maxTime) maxTime = t;
  }
  return [0, maxTime];
}

/** Derive symmetric Y domain from all channel data. */
function getYDomain(channels: AnalogChannel[]): [number, number] {
  if (channels.length === 0) return [-1, 1];
  let absMax = 0;
  for (const ch of channels) {
    for (let i = 0; i < ch.data.length; i++) {
      const v = Math.abs(ch.data[i]);
      if (v > absMax) absMax = v;
    }
  }
  // Add 10 % headroom
  const pad = absMax * 0.1 || 1;
  return [-(absMax + pad), absMax + pad];
}

/** Get primary unit label from channels. */
function getUnitLabel(channels: AnalogChannel[]): string {
  if (channels.length === 0) return "";
  const units = new Set(channels.map((c) => c.unit));
  return [...units].join(" / ");
}

/** Format seconds → milliseconds label for the X axis. */
function formatXTick(seconds: number): string {
  const ms = seconds * 1000;
  // Show at most 2 decimal places, drop trailing zeros
  if (Math.abs(ms) < 0.01) return "0 ms";
  return `${parseFloat(ms.toFixed(2))} ms`;
}

/** Format Y tick values with SI-style abbreviation. */
function formatYTick(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  if (abs === 0) return "0";
  return value.toFixed(1);
}

// ---------------------------------------------------------------------------
// useHorizontalZoom — custom hook for constrained X-only pan & zoom
// ---------------------------------------------------------------------------

interface ZoomState {
  xMin: number;
  xMax: number;
}

function useHorizontalZoom(fullDomain: [number, number]) {
  const [zoom, setZoom] = useState<ZoomState>({
    xMin: fullDomain[0],
    xMax: fullDomain[1],
  });

  // Keep a ref to the latest zoom for event handlers (avoids stale closures)
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const fullRef = useRef(fullDomain);
  fullRef.current = fullDomain;

  /** Reset to full domain. */
  const resetZoom = useCallback(() => {
    setZoom({ xMin: fullRef.current[0], xMax: fullRef.current[1] });
  }, []);

  /**
   * Wheel handler: zoom in/out around the cursor's X position.
   * `cursorFrac` is 0..1 representing where in the plot area the cursor is.
   */
  const handleWheel = useCallback((deltaY: number, cursorFrac: number) => {
    setZoom((prev) => {
      const span = prev.xMax - prev.xMin;
      const zoomFactor = 1 + deltaY * ZOOM_SENSITIVITY;
      let newSpan = span * zoomFactor;

      // Clamp minimum span
      const fullSpan = fullRef.current[1] - fullRef.current[0];
      newSpan = Math.max(MIN_DOMAIN_SPAN, Math.min(newSpan, fullSpan));

      // Pivot around cursor position
      const cursor = prev.xMin + span * cursorFrac;
      let newMin = cursor - newSpan * cursorFrac;
      let newMax = cursor + newSpan * (1 - cursorFrac);

      // Clamp to full domain
      if (newMin < fullRef.current[0]) {
        newMin = fullRef.current[0];
        newMax = newMin + newSpan;
      }
      if (newMax > fullRef.current[1]) {
        newMax = fullRef.current[1];
        newMin = newMax - newSpan;
      }

      return { xMin: newMin, xMax: newMax };
    });
  }, []);

  /**
   * Pan to an absolute target domain [newMin, newMax], clamped to bounds.
   * Uses functional updater — safe from stale closures.
   */
  const panTo = useCallback((targetMin: number, targetMax: number) => {
    setZoom(() => {
      const span = targetMax - targetMin;
      let newMin = targetMin;
      let newMax = targetMax;

      // Clamp to full domain
      if (newMin < fullRef.current[0]) {
        newMin = fullRef.current[0];
        newMax = newMin + span;
      }
      if (newMax > fullRef.current[1]) {
        newMax = fullRef.current[1];
        newMin = newMax - span;
      }

      return { xMin: newMin, xMax: newMax };
    });
  }, []);

  return { zoom, resetZoom, handleWheel, panTo };
}

// ---------------------------------------------------------------------------
// InnerAnalogChart
// ---------------------------------------------------------------------------

function InnerAnalogChart({ width, height, channels }: InnerChartProps) {
  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  // Domain computation
  const fullDomain = useMemo(() => getFullDomain(channels), [channels]);
  const yDomain = useMemo(() => getYDomain(channels), [channels]);
  const unitLabel = useMemo(() => getUnitLabel(channels), [channels]);

  // Zoom / pan state
  const { zoom, resetZoom, handleWheel, panTo } = useHorizontalZoom(fullDomain);

  // ---- Scales ----
  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [zoom.xMin, zoom.xMax],
        range: [0, innerWidth],
      }),
    [zoom.xMin, zoom.xMax, innerWidth],
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: yDomain,
        range: [innerHeight, 0],
        nice: true,
      }),
    [yDomain, innerHeight],
  );

  // ---- Drag state ----
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startDomain: [number, number];
  } | null>(null);

  // ---- Event handlers ----
  const onWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
      const mouseX = e.clientX - rect.left - MARGIN.left;
      const frac = Math.max(0, Math.min(1, mouseX / innerWidth));
      handleWheel(e.deltaY, frac);
    },
    [handleWheel, innerWidth],
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (e.button !== 0) return; // left click only
      e.preventDefault();
      dragRef.current = {
        active: true,
        startX: e.clientX,
        startDomain: [zoom.xMin, zoom.xMax],
      };
      // Attach window listeners for drag
      const onMove = (me: MouseEvent) => {
        if (!dragRef.current?.active) return;
        const dx = me.clientX - dragRef.current.startX;
        const span =
          dragRef.current.startDomain[1] - dragRef.current.startDomain[0];
        const deltaSec = -(dx / innerWidth) * span;
        // Compute absolute target domain from the drag start point
        panTo(
          dragRef.current.startDomain[0] + deltaSec,
          dragRef.current.startDomain[1] + deltaSec,
        );
      };
      const onUp = () => {
        if (dragRef.current) dragRef.current.active = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [zoom.xMin, zoom.xMax, innerWidth, panTo],
  );

  const onDoubleClick = useCallback(() => {
    resetZoom();
  }, [resetZoom]);

  // Unique clip-path id
  const clipId = "analog-chart-clip";

  if (innerWidth <= 0 || innerHeight <= 0) return null;

  return (
    <svg
      width={width}
      height={height}
      style={{ cursor: "grab", userSelect: "none" }}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    >
      <defs>
        <clipPath id={clipId}>
          <rect width={innerWidth} height={innerHeight} />
        </clipPath>
      </defs>

      <Group left={MARGIN.left} top={MARGIN.top}>
        {/* ---- Grid lines ---- */}
        <GridColumns
          scale={xScale}
          height={innerHeight}
          stroke={GRID_STROKE}
          strokeWidth={1}
          numTicks={Math.max(4, Math.floor(innerWidth / 100))}
        />
        <GridRows
          scale={yScale}
          width={innerWidth}
          stroke={GRID_STROKE}
          strokeWidth={1}
          numTicks={Math.max(4, Math.floor(innerHeight / 50))}
        />

        {/* ---- Zero line (horizontal) ---- */}
        <line
          x1={0}
          x2={innerWidth}
          y1={yScale(0)}
          y2={yScale(0)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1}
          strokeDasharray="4,3"
        />

        {/* ---- Clip region for future WebGL / data overlay ---- */}
        <g clipPath={`url(#${clipId})`}>
          {/*
           * DATA RENDERING COMPOSITED HERE
           * The WebGL canvas or regl-based line renderer will be positioned
           * absolutely over this region. The xScale, yScale, and zoom state
           * are available for coordinate mapping.
           */}
        </g>

        {/* ---- X Axis (bottom) ---- */}
        <AxisBottom
          top={innerHeight}
          scale={xScale}
          numTicks={Math.max(4, Math.floor(innerWidth / 100))}
          tickFormat={(v) => formatXTick(v as number)}
          stroke={AXIS_STROKE}
          // tickStroke={AXIS_STROKE}
          tickLabelProps={{
            fill: TICK_LABEL_COLOR,
            fontSize: 10,
            fontFamily: "ui-monospace, monospace",
            textAnchor: "middle",
            dy: "0.0em",
          }}
          // label="Time (ms)"
          labelProps={{
            fill: AXIS_LABEL_COLOR,
            fontSize: 11,
            fontFamily: "ui-monospace, monospace",
            textAnchor: "middle",
          }}
        />

        {/* ---- Y Axis (left) ---- */}
        <AxisLeft
          scale={yScale}
          numTicks={Math.max(4, Math.floor(innerHeight / 50))}
          tickFormat={(v) => formatYTick(v as number)}
          stroke={AXIS_STROKE}
          tickStroke={AXIS_STROKE}
          tickLabelProps={{
            fill: TICK_LABEL_COLOR,
            fontSize: 10,
            fontFamily: "ui-monospace, monospace",
            textAnchor: "end",
            dx: "-0.4em",
            dy: "0.3em",
          }}
          // label={unitLabel}
          labelProps={{
            fill: AXIS_LABEL_COLOR,
            fontSize: 11,
            fontFamily: "ui-monospace, monospace",
            textAnchor: "middle",
          }}
        />

        {/* ---- Channel legend (compact, top-left) ---- */}
        {channels.map((ch, i) => (
          <g key={ch.label} transform={`translate(8, ${14 + i * 16})`}>
            <rect
              width={10}
              height={3}
              y={-2}
              rx={1}
              fill={ch.color ?? CHANNEL_COLORS[i % CHANNEL_COLORS.length]}
            />
            <text
              x={14}
              dy="0.35em"
              fill={TICK_LABEL_COLOR}
              fontSize={10}
              fontFamily="ui-monospace, monospace"
            >
              {ch.label} ({ch.unit})
            </text>
          </g>
        ))}
      </Group>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Public wrapper (responsive)
// ---------------------------------------------------------------------------

export function AnalogChart({ channels = [] }: { channels?: AnalogChannel[] }) {
  return (
    <ParentSize debounceTime={50}>
      {({ width, height }) =>
        width > 0 && height > 0 ? (
          <InnerAnalogChart width={width} height={height} channels={channels} />
        ) : null
      }
    </ParentSize>
  );
}
