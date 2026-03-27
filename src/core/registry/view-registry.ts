import AnalogIndex from "@/features/analog";
import DigitalIndex from "@/features/digital";
import EventIndex from "@/features/event";
import HarmonicsIndex from "@/features/harmonics";
import PhasorIndex from "@/features/phasor";
import { IDockviewPanelProps } from "dockview";

export interface ViewMetadata {
    id: string;
    title: string;
    component: React.FC<IDockviewPanelProps<{ viewType: ViewType }>>;
    //  TODO: implement using an icon library such as lucide-react or similar
    icon?: string;
}

export const VIEW_REGISTRY: Record<string, ViewMetadata> = {
    EVENT: {
        id: "event",
        title: "Event View",
        component: EventIndex,
    },
    ANALOG: {
        id: "analog",
        title: "Analog View",
        component: AnalogIndex,
    },
    DIGITAL: {
        id: "digital",
        title: "Digital View",
        component: DigitalIndex,
    },
    PHASOR: {
        id: "phasor",
        title: "Phasor View",
        component: PhasorIndex,
    },
    HARMONICS: {
        id: "harmonics",
        title: "Harmonics View",
        component: HarmonicsIndex
    }
};

export type ViewType = keyof typeof VIEW_REGISTRY;