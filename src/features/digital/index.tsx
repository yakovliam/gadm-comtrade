import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DatabaseIcon, Settings2Icon } from "lucide-react";
import { DigitalChart, type DigitalChannel } from "./chart";

function generateDigitalData(
  sampleRate: number,
  durationSeconds: number,
  transitionTimes: number[],
): Array<{ timestamp: number; value: number }> {
  const totalSamples = sampleRate * durationSeconds;
  const data: Array<{ timestamp: number; value: number }> = [];

  let state = 0;
  let nextTransitionIdx = 0;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;

    if (
      nextTransitionIdx < transitionTimes.length &&
      t >= transitionTimes[nextTransitionIdx]
    ) {
      state = state ? 0 : 1;
      nextTransitionIdx++;
    }

    data.push({ timestamp: t, value: state });
  }

  return data;
}

function useTestChannels(): DigitalChannel[] {
  return useMemo(() => {
    const sampleRate = 9600;
    const duration = 1;

    return [
      {
        label: "BRK_52A",
        data: generateDigitalData(sampleRate, duration, [
          0.12, 0.35, 0.58, 0.71,
        ]),
        color: "var(--color-chart-blue1)",
      },
      {
        label: "BRK_52B",
        data: generateDigitalData(sampleRate, duration, [
          0.13, 0.36, 0.59, 0.72,
        ]),
        color: "var(--color-chart-red1)",
      },
      {
        label: "TRIP_CMD",
        data: generateDigitalData(sampleRate, duration, [0.34, 0.6]),
        color: "var(--color-chart-green1)",
      },
      {
        label: "LOCKOUT",
        data: generateDigitalData(sampleRate, duration, [0.35, 0.61]),
        color: "var(--color-chart-yellow1)",
      },
      {
        label: "RECLOSING",
        data: generateDigitalData(sampleRate, duration, [
          0.2, 0.25, 0.45, 0.5, 0.7, 0.75,
        ]),
        color: "var(--color-chart-orange1)",
      },
      {
        label: "AUTO_CLOSE",
        data: generateDigitalData(sampleRate, duration, [0.4, 0.8]),
        color: "var(--color-chart-violet1)",
      },
      {
        label: "ALARM_1",
        data: generateDigitalData(sampleRate, duration, [
          0.15, 0.22, 0.55, 0.65, 0.88, 0.95,
        ]),
        color: "var(--color-chart-pink1)",
      },
      {
        label: "ALARM_2",
        data: generateDigitalData(sampleRate, duration, [
          0.1, 0.18, 0.3, 0.42, 0.63, 0.77, 0.85, 0.92,
        ]),
        color: "var(--color-chart-gray1)",
      },
    ];
  }, []);
}

const DigitalIndex = () => {
  const channels = useTestChannels();

  return (
    <div className="flex flex-col h-full text-white relative">
      <ControlsOverlay />
      <div className="flex-1 w-full min-h-0">
        <DigitalChart channels={channels} />
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

export default DigitalIndex;
