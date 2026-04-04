import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DatabaseIcon, Settings2Icon } from "lucide-react";
import { AnalogChart, type AnalogChannel } from "./chart";

function generateSineData(
  sampleRate: number,
  durationSeconds: number,
  frequency: number,
  amplitude: number,
  phase: number,
): Float32Array {
  const totalSamples = sampleRate * durationSeconds;
  const data = new Float32Array(totalSamples);
  const omega = 2 * Math.PI * frequency;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const noise = (Math.random() - 0.5) * 0.02;
    data[i] = amplitude * Math.sin(omega * t + phase) + noise;
  }

  return data;
}

function useTestChannels(): AnalogChannel[] {
  return useMemo(() => {
    const sampleRate = 9600;
    const duration = 1;
    const freq = 60;

    return [
      {
        label: "IA",
        unit: "Amps",
        sampleRate,
        data: generateSineData(sampleRate, duration, freq, 500, 0),
        color: "var(--color-chart-blue1)",
      },
      {
        label: "IB",
        unit: "Amps",
        sampleRate,
        data: generateSineData(
          sampleRate,
          duration,
          freq,
          500,
          (-2 * Math.PI) / 3,
        ),
        color: "var(--color-chart-red1)",
      },
      {
        label: "IC",
        unit: "Amps",
        sampleRate,
        data: generateSineData(
          sampleRate,
          duration,
          freq,
          500,
          (2 * Math.PI) / 3,
        ),
        color: "var(--color-chart-green1)",
      },
      // {
      //   label: "VA",
      //   unit: "Volts",
      //   sampleRate,
      //   data: generateSineData(sampleRate, duration, freq, 70000, 0),
      //   color: "var(--color-chart-yellow1)",
      // },
      // {
      //   label: "VB",
      //   unit: "Volts",
      //   sampleRate,
      //   data: generateSineData(
      //     sampleRate,
      //     duration,
      //     freq,
      //     70000,
      //     (-2 * Math.PI) / 3,
      //   ),
      //   color: "var(--color-chart-orange1)",
      // },
      // {
      //   label: "VC",
      //   unit: "Volts",
      //   sampleRate,
      //   data: generateSineData(
      //     sampleRate,
      //     duration,
      //     freq,
      //     70000,
      //     (2 * Math.PI) / 3,
      //   ),
      //   color: "var(--color-chart-violet1)",
      // },
    ];
  }, []);
}

const AnalogIndex = () => {
  const channels = useTestChannels();

  return (
    <div className="flex flex-col h-full text-white relative">
      <ControlsOverlay />
      <div className="flex-1 w-full min-h-0">
        <AnalogChart channels={channels} />
      </div>
    </div>
  );
};

const ControlsOverlay = () => {
  return (
    <div className="absolute top-2 right-2 z-50">
      <Button variant="secondary" size="xs">
        <DatabaseIcon />
        <span className="text-xs font-mono">SOURCES</span>
      </Button>
      <Button variant="secondary" size="xs" className="ml-2">
        <Settings2Icon />
        <span className="text-xs font-mono">OPTIONS</span>
      </Button>
    </div>
  );
};

export default AnalogIndex;
