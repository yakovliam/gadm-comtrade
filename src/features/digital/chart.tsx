import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { AxisBottom } from "@visx/axis";
import { GridColumns } from "@visx/grid";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DigitalChannel {
  label: string;
  data: Array<{ timestamp: number; value: number }>;
  color?: string;
}

interface ZoomState {
  xMin: number;
  xMax: number;
}

interface DigitalChartProps {
  channels?: DigitalChannel[];
  rowHeight?: number;
}

interface InnerDigitalChartProps {
  width: number;
  height: number;
  channels: DigitalChannel[];
  rowHeight: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LABEL_WIDTH = 140;
const AXIS_HEIGHT = 30;
const ROW_PADDING = 6;
const ROW_SEPARATOR_COLOR = "rgba(255,255,255,0.08)";

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
const MIN_DOMAIN_SPAN = 0.0005;

const GRID_STROKE = "rgba(255,255,255,0.07)";
const AXIS_STROKE = "rgba(255,255,255,0.25)";
const TICK_LABEL_COLOR = "rgba(255,255,255,0.55)";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getFullDomain(channels: DigitalChannel[]): [number, number] {
  if (channels.length === 0) return [0, 1];
  let maxTime = 0;
  for (const ch of channels) {
    if (ch.data.length > 0) {
      const t = ch.data[ch.data.length - 1].timestamp;
      if (t > maxTime) maxTime = t;
    }
  }
  return [0, maxTime];
}

function formatXTick(seconds: number): string {
  const ms = seconds * 1000;
  if (Math.abs(ms) < 0.01) return "0 ms";
  return `${parseFloat(ms.toFixed(2))} ms`;
}

function buildStepPath(
  data: Array<{ timestamp: number; value: number }>,
  xScale: (v: number) => number,
  highY: number,
  lowY: number,
  xMin: number,
  xMax: number,
): string {
  if (data.length === 0) return "";

  const parts: string[] = [];
  let started = false;

  for (let i = 0; i < data.length; i++) {
    const { timestamp, value } = data[i];
    const y = value ? highY : lowY;
    const x = xScale(timestamp);

    const nextTs = i < data.length - 1 ? data[i + 1].timestamp : xMax;
    const nextX = xScale(Math.min(nextTs, xMax));

    if (!started) {
      parts.push(`M${x},${y}`);
      started = true;
    }

    parts.push(`L${nextX},${y}`);
    if (i < data.length - 1) {
      const nextY = data[i + 1].value ? highY : lowY;
      parts.push(`L${nextX},${nextY}`);
    }
  }

  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// useSharedHorizontalZoom
// ---------------------------------------------------------------------------

function useSharedHorizontalZoom(fullDomain: [number, number]) {
  const [zoom, setZoom] = useState<ZoomState>({
    xMin: fullDomain[0],
    xMax: fullDomain[1],
  });

  const zoomRef = useRef(zoom);
  const fullRef = useRef(fullDomain);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    fullRef.current = fullDomain;
  }, [fullDomain]);

  const resetZoom = useCallback(() => {
    setZoom({ xMin: fullRef.current[0], xMax: fullRef.current[1] });
  }, []);

  const handleWheel = useCallback((deltaY: number, cursorFrac: number) => {
    setZoom((prev) => {
      const span = prev.xMax - prev.xMin;
      const zoomFactor = 1 + deltaY * ZOOM_SENSITIVITY;
      let newSpan = span * zoomFactor;

      const fullSpan = fullRef.current[1] - fullRef.current[0];
      newSpan = Math.max(MIN_DOMAIN_SPAN, Math.min(newSpan, fullSpan));

      const cursor = prev.xMin + span * cursorFrac;
      let newMin = cursor - newSpan * cursorFrac;
      let newMax = cursor + newSpan * (1 - cursorFrac);

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

  const panTo = useCallback((targetMin: number, targetMax: number) => {
    setZoom(() => {
      const span = targetMax - targetMin;
      let newMin = targetMin;
      let newMax = targetMax;

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
// LabelPanel — left column with channel names, color swatch, and scrollbar
// ---------------------------------------------------------------------------

interface LabelPanelProps {
  channels: DigitalChannel[];
  rowHeight: number;
  containerHeight: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
}

function LabelPanel({
  channels,
  rowHeight,
  containerHeight,
  scrollRef,
  onScroll,
}: LabelPanelProps) {
  const totalHeight = channels.length * rowHeight;
  const viewHeight = containerHeight - AXIS_HEIGHT;
  const needsScroll = totalHeight > viewHeight;

  return (
    <div
      style={{
        width: LABEL_WIDTH,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: viewHeight,
          overflowY: needsScroll ? "auto" : "hidden",
          overflowX: "hidden",
        }}
        ref={scrollRef}
        onScroll={onScroll}
      >
        <div style={{ height: totalHeight }}>
          {channels.map((ch, i) => (
            <div
              key={ch.label}
              style={{
                height: rowHeight,
                display: "flex",
                alignItems: "center",
                padding: "0 10px",
                gap: 8,
                background:
                  i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent",
                borderBottom: `1px solid ${ROW_SEPARATOR_COLOR}`,
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 18,
                  borderRadius: 1,
                  flexShrink: 0,
                  background:
                    ch.color ?? CHANNEL_COLORS[i % CHANNEL_COLORS.length],
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "ui-monospace, monospace",
                  color: TICK_LABEL_COLOR,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {ch.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: AXIS_HEIGHT, flexShrink: 0 }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// ChartPanel — right area with waveforms, zoom, and X axis
// ---------------------------------------------------------------------------

interface ChartPanelProps {
  channels: DigitalChannel[];
  rowHeight: number;
  chartWidth: number;
  chartHeight: number;
  xScale: (v: number) => number;
  xScaleObj: ReturnType<typeof scaleLinear<number>>;
  zoom: ZoomState;
  onZoomWheel: (deltaY: number, cursorFrac: number) => void;
  onMouseDown: (e: MouseEvent) => void;
  onDoubleClick: () => void;
  scrollTop: number;
}

function ChartPanel({
  channels,
  rowHeight,
  chartWidth,
  chartHeight,
  xScale,
  xScaleObj,
  zoom,
  onZoomWheel,
  onMouseDown,
  onDoubleClick,
  scrollTop,
}: ChartPanelProps) {
  const totalHeight = channels.length * rowHeight;
  const viewHeight = chartHeight - AXIS_HEIGHT;
  const svgHeight = Math.max(totalHeight, viewHeight);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Native non-passive wheel listener for zoom (capture phase)
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;

    const handler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const frac = Math.max(0, Math.min(1, mouseX / chartWidth));
      onZoomWheel(e.deltaY, frac);
    };

    el.addEventListener("wheel", handler, { capture: true, passive: false });
    return () => el.removeEventListener("wheel", handler, { capture: true });
  }, [chartWidth, onZoomWheel]);

  // Native mousedown listener for panning (capture phase)
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;

    const handler = (e: globalThis.MouseEvent) => {
      onMouseDown(e);
    };

    el.addEventListener("mousedown", handler, { capture: true });
    return () => el.removeEventListener("mousedown", handler, { capture: true });
  }, [onMouseDown]);

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Waveform area — overflow hidden, SVG positioned by scrollTop */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
        onDoubleClick={onDoubleClick}
      >
        <svg
          ref={svgRef}
          width={chartWidth}
          height={svgHeight}
          style={{
            position: "absolute",
            top: -scrollTop,
            left: 0,
            cursor: "grab",
            userSelect: "none",
          }}
        >
          {channels.map((ch, i) => {
            const top = i * rowHeight;
            const highY = top + ROW_PADDING + 2;
            const lowY = top + rowHeight - ROW_PADDING - 2;
            const pathD = buildStepPath(
              ch.data,
              xScale,
              highY,
              lowY,
              zoom.xMin,
              zoom.xMax,
            );

            return (
              <g key={ch.label}>
                {/* Row background */}
                <rect
                  x={0}
                  y={top}
                  width={chartWidth}
                  height={rowHeight}
                  fill={
                    i % 2 === 0
                      ? "rgba(255,255,255,0.03)"
                      : "transparent"
                  }
                />

                {/* Step waveform */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={
                      ch.color ?? CHANNEL_COLORS[i % CHANNEL_COLORS.length]
                    }
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                  />
                )}

                {/* Row separator */}
                <line
                  x1={0}
                  x2={chartWidth}
                  y1={top + rowHeight - 0.5}
                  y2={top + rowHeight - 0.5}
                  stroke={ROW_SEPARATOR_COLOR}
                  strokeWidth={1}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Fixed X axis */}
      <div style={{ height: AXIS_HEIGHT, flexShrink: 0 }}>
        <svg width={chartWidth} height={AXIS_HEIGHT}>
          <GridColumns
            scale={xScaleObj}
            height={AXIS_HEIGHT}
            stroke={GRID_STROKE}
            strokeWidth={1}
            numTicks={Math.max(4, Math.floor(chartWidth / 100))}
          />
          <AxisBottom
            scale={xScaleObj}
            top={0}
            numTicks={Math.max(4, Math.floor(chartWidth / 100))}
            tickFormat={(v) => formatXTick(v as number)}
            stroke={AXIS_STROKE}
            tickLabelProps={{
              fill: TICK_LABEL_COLOR,
              fontSize: 10,
              fontFamily: "ui-monospace, monospace",
              textAnchor: "middle",
              dy: "0.0em",
            }}
          />
        </svg>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// InnerDigitalChart
// ---------------------------------------------------------------------------

function InnerDigitalChart({
  width,
  height,
  channels,
  rowHeight,
}: InnerDigitalChartProps) {
  const chartWidth = width - LABEL_WIDTH;
  const fullDomain = useMemo(() => getFullDomain(channels), [channels]);
  const { zoom, resetZoom, handleWheel, panTo } =
    useSharedHorizontalZoom(fullDomain);

  const xScaleObj = useMemo(
    () =>
      scaleLinear<number>({
        domain: [zoom.xMin, zoom.xMax],
        range: [0, chartWidth],
      }),
    [zoom.xMin, zoom.xMax, chartWidth],
  );

  const xScale = useCallback((v: number) => xScaleObj(v), [xScaleObj]);

  // --- Vertical scroll: label panel is the source of truth ---
  const labelRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const onLabelScroll = useCallback(() => {
    if (labelRef.current) {
      setScrollTop(labelRef.current.scrollTop);
    }
  }, []);

  // --- Wheel → zoom ---
  const onZoomWheel = useCallback(
    (deltaY: number, cursorFrac: number) => {
      handleWheel(deltaY, cursorFrac);
    },
    [handleWheel],
  );

  // --- Drag → horizontal pan ---
  const zoomRef = useRef(zoom);
  const chartWidthRef = useRef(chartWidth);
  const panToRef = useRef(panTo);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    chartWidthRef.current = chartWidth;
  }, [chartWidth]);

  useEffect(() => {
    panToRef.current = panTo;
  }, [panTo]);

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();

      const startClientX = e.clientX;
      const startDomain: [number, number] = [
        zoomRef.current.xMin,
        zoomRef.current.xMax,
      ];

      const onMove = (me: globalThis.MouseEvent) => {
        const dx = me.clientX - startClientX;
        const span = startDomain[1] - startDomain[0];
        const cw = chartWidthRef.current;
        const deltaSec = -(dx / cw) * span;
        panToRef.current(startDomain[0] + deltaSec, startDomain[1] + deltaSec);
      };

      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [],
  );

  const onDoubleClick = useCallback(() => {
    resetZoom();
  }, [resetZoom]);

  if (chartWidth <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        overflow: "hidden",
      }}
    >
      <LabelPanel
        channels={channels}
        rowHeight={rowHeight}
        containerHeight={height}
        scrollRef={labelRef}
        onScroll={onLabelScroll}
      />

      <ChartPanel
        channels={channels}
        rowHeight={rowHeight}
        chartWidth={chartWidth}
        chartHeight={height}
        xScale={xScale}
        xScaleObj={xScaleObj}
        zoom={zoom}
        onZoomWheel={onZoomWheel}
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
        scrollTop={scrollTop}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public wrapper
// ---------------------------------------------------------------------------

export function DigitalChart({
  channels = [],
  rowHeight = 70,
}: DigitalChartProps) {
  return (
    <ParentSize debounceTime={50}>
      {({ width, height }) =>
        width > 0 && height > 0 ? (
          <InnerDigitalChart
            width={width}
            height={height}
            channels={channels}
            rowHeight={rowHeight}
          />
        ) : null
      }
    </ParentSize>
  );
}
