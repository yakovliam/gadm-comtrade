import AnalogIndex from "@/features/analog";
import AnalogTab from "@/features/analog/tab";
import DigitalIndex from "@/features/digital";
import DigitalTab from "@/features/digital/tab";
import EventIndex from "@/features/event";
import EventTab from "@/features/event/tab";
import HarmonicsIndex from "@/features/harmonics";
import HarmonicsTab from "@/features/harmonics/tab";
import PhasorIndex from "@/features/phasor";
import PhasorTab from "@/features/phasor/tab";
import { IDockviewPanelHeaderProps, IDockviewPanelProps } from "dockview";

export interface ViewMetadata {
  id: string;
  title: string;
  component: React.FC<IDockviewPanelProps<{ viewType: ViewType }>>;
  tabComponent: React.FC<IDockviewPanelHeaderProps<{ viewType: ViewType }>>;
}

export const VIEW_REGISTRY: Record<string, ViewMetadata> = {
  EVENT: {
    id: "event",
    title: "Event View",
    component: EventIndex,
    tabComponent: EventTab,
  },
  ANALOG: {
    id: "analog",
    title: "Analog View",
    component: AnalogIndex,
    tabComponent: AnalogTab,
  },
  DIGITAL: {
    id: "digital",
    title: "Digital View",
    component: DigitalIndex,
    tabComponent: DigitalTab,
  },
  PHASOR: {
    id: "phasor",
    title: "Phasor View",
    component: PhasorIndex,
    tabComponent: PhasorTab,
  },
  HARMONICS: {
    id: "harmonics",
    title: "Harmonics View",
    component: HarmonicsIndex,
    tabComponent: HarmonicsTab,
  },
};

export type ViewType = keyof typeof VIEW_REGISTRY;
