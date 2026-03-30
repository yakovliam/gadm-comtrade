import { Button } from "@/components/ui/button";
import { DatabaseIcon, Settings2Icon, SettingsIcon } from "lucide-react";
import ResizableAnalogViewer from "./test-chart";

/**
 * Generates synthetic 3-phase sine wave data.
 * @param sampleRate - Samples per second (e.g., 9600 for high-res COMTRADE)
 * @param durationSeconds - Length of the "recording"
 * @param frequency - Grid frequency (50Hz or 60Hz)
 */
export const generateSineTestData = (
  sampleRate: number = 9600,
  durationSeconds: number = 1,
  frequency: number = 60,
): Float32Array => {
  const totalSamples = sampleRate * durationSeconds;
  const data = new Float32Array(totalSamples);

  // Angular frequency: 2 * PI * f
  const omega = 2 * Math.PI * frequency;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    // Standard Sine: A * sin(ωt + phase)
    // We'll add some "noise" to make it look like a real analog signal
    const noise = (Math.random() - 0.5) * 0.02;
    data[i] = Math.sin(omega * t) + noise;
  }

  return data;
};

const AnalogIndex = () => {
  // TODO: Determination:
  //       Use visx for defining axis, labels, grid, etc...
  //       Use webgl-plot for the actual waveform rendering (since it can handle large datasets at high performance)
  //       Possibly research using regl directly for even more control and performance, but that would require building more of the charting infrastructure ourselves.
  return (
    <div className="flex flex-col items-center justify-center h-full text-white text-center relative">
      <ControlsOverlay />
      <div className="flex-1 w-full">
        {/* <ResizableAnalogViewer data={generateSineTestData()} /> */}
      </div>
      {/* <h1>Analog Index</h1> */}
      {/* <p>This is an empty analog page.</p> */}
    </div>
  );
};

const ControlsOverlay = () => {
  return (
    <div className="absolute top-2 right-2 z-50">
      <Button variant="outline" size="xs">
        <DatabaseIcon />
        <span className="text-xs font-mono">SOURCES</span>
      </Button>
      <Button variant="outline" size="xs" className="ml-2">
        <Settings2Icon />
        <span className="text-xs font-mono">OPTIONS</span>
      </Button>
    </div>
  );
};

export default AnalogIndex;
