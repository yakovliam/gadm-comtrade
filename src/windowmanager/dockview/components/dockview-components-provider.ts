import { IDockviewPanelProps } from "dockview";
import { FunctionComponent } from "react";
import DockviewPanelWrapper from "../panel/DockviewPanelWrapper";

export const components: Record<string, FunctionComponent<IDockviewPanelProps>> = {
    default: DockviewPanelWrapper
};