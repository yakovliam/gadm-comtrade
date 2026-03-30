import React, { useRef, useEffect, useMemo } from "react";
import { Zoom } from "@visx/zoom";
import { ParentSize } from "@visx/responsive";
import regl from "regl";

const initReglRenderer = (canvas: HTMLCanvasElement) => {
  const reglInstance = regl({ canvas });

  const drawWaveform = reglInstance({
    frag: `
      precision mediump float;
      uniform vec4 color;
      void main() {
        gl_FragColor = color;
      }
    `,
    vert: `
      precision highp float;
      attribute float yValue;
      attribute float index;
      
      uniform float totalSamples;
      uniform vec2 zoomScale;      
      uniform vec2 zoomTranslate;  
      
      void main() {
        // 1. Map index (0 to total) to WebGL X (-1 to 1)
        float xNormal = (index / (totalSamples - 1.0)) * 2.0 - 1.0;
        
        // 2. Apply visx transform
        // visx translateX is in pixels, we convert to NDC (-1 to 1) 
        // by dividing by (width/2) roughly, but easier to pass pre-calculated
        float xPos = (xNormal * zoomScale.x) + zoomTranslate.x;
        
        // yValue is already normalized or scaled by user
        gl_Position = vec4(xPos, yValue, 0, 1);
      }
    `,
    attributes: {
      yValue: reglInstance.prop<any, "yBuffer">("yBuffer"),
      index: reglInstance.prop<any, "indexBuffer">("indexBuffer"),
    },
    uniforms: {
      totalSamples: reglInstance.prop<any, "totalSamples">("totalSamples"),
      zoomScale: reglInstance.prop<any, "zoomScale">("zoomScale"),
      zoomTranslate: reglInstance.prop<any, "zoomTranslate">("zoomTranslate"),
      color: [0.1, 0.5, 0.9, 1.0],
    },
    count: reglInstance.prop<any, "count">("count"),
    primitive: "line strip",
  });

  return { reglInstance, drawWaveform };
};

const AnalogViewer = ({
  width,
  height,
  yData,
}: {
  width: number;
  height: number;
  yData: Float32Array;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reglRendererRef = useRef<any>(null);

  // Initialize REGL once
  useEffect(() => {
    if (!canvasRef.current) return;
    const renderer = initReglRenderer(canvasRef.current);
    reglRendererRef.current = renderer;
    return () => renderer.reglInstance.destroy(); // Cleanup
  }, []);

  // Sync buffers with yData changes
  const gpuBuffers = useMemo(() => {
    if (!reglRendererRef.current || !yData) return null;
    const { reglInstance } = reglRendererRef.current;

    // Create a linear index array [0, 1, 2, ...]
    const indices = new Float32Array(yData.length);
    for (let i = 0; i < yData.length; i++) indices[i] = i;

    return {
      yBuffer: reglInstance.buffer(yData),
      indexBuffer: reglInstance.buffer(indices),
      count: yData.length,
    };
  }, [yData, reglRendererRef.current]);

  return (
    <Zoom
      width={width}
      height={height}
      scaleXMin={1}
      scaleXMax={1000}
      scaleYMin={1}
      scaleYMax={1}
    >
      {(zoom) => {
        if (reglRendererRef.current && gpuBuffers) {
          const { reglInstance, drawWaveform } = reglRendererRef.current;

          // Convert Visx Pixel Translation to WebGL Clip Space (-1 to 1)
          // formula: (pixel_offset / width) * 2.0 * scale
          const webglTranslateX =
            (zoom.transformMatrix.translateX / width) * 2.0;

          reglInstance.poll(); // Update canvas size internally
          reglInstance.clear({ color: [1, 1, 1, 1], depth: 1 });

          drawWaveform({
            ...gpuBuffers,
            totalSamples: gpuBuffers.count,
            zoomScale: [zoom.transformMatrix.scaleX, 1],
            zoomTranslate: [
              webglTranslateX + (zoom.transformMatrix.scaleX - 1),
              0,
            ],
          });
        }

        return (
          <div
            style={{ position: "relative", width, height, overflow: "hidden" }}
          >
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                display: "block",
              }}
            />
            <svg
              width={width}
              height={height}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                cursor: zoom.isDragging ? "grabbing" : "grab",
              }}
              onMouseDown={zoom.dragStart}
              onMouseMove={zoom.dragMove}
              onMouseUp={zoom.dragEnd}
              onMouseLeave={zoom.dragEnd}
              onWheel={zoom.handleWheel}
            />
          </div>
        );
      }}
    </Zoom>
  );
};

export default function ResizableAnalogViewer({
  data,
}: {
  data: Float32Array;
}) {
  return (
    <ParentSize>
      {({ width, height }) =>
        width > 0 && height > 0 ? (
          <AnalogViewer width={width} height={height} yData={data} />
        ) : null
      }
    </ParentSize>
  );
}
