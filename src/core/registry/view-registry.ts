import AssetExplorerIndex from "@/features/asset-explorer";
import HomeMapIndex from "@/features/home-map";
import TaskExplorerIndex from "@/features/task-explorer";
import { IDockviewPanelProps } from "dockview";

export interface ViewMetadata {
    id: string;
    title: string;
    component: React.FC<IDockviewPanelProps<{ viewType: ViewType }>>;
    //  TODO: implement using an icon library such as lucide-react or similar
    icon?: string;
}

export const VIEW_REGISTRY: Record<string, ViewMetadata> = {
    HOME_MAP: {
        id: "home-map",
        title: "Home Map",
        component: HomeMapIndex,
    },
    ASSET_EXPLORER: {
        id: "asset-explorer",
        title: "Asset Explorer",
        component: AssetExplorerIndex,
    },
    TASK_EXPLORER: {
        id: "task-explorer",
        title: "Task Explorer",
        component: TaskExplorerIndex,
    },
};

export type ViewType = keyof typeof VIEW_REGISTRY;