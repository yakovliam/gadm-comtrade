import { IDockviewPanelHeaderProps, IDockviewPanelProps } from "dockview";
import { FunctionComponent } from "react";
import DockviewPanelWrapper from "../panel/DockviewPanelWrapper";
import DockviewPanelHeaderWrapper from "../panel/DockviewPanelHeaderWrapper";

export const components: Record<string, FunctionComponent<IDockviewPanelProps>> = {
    default: DockviewPanelWrapper
};

export const tabComponents: Record<string, FunctionComponent<IDockviewPanelHeaderProps>> = {
    default: DockviewPanelHeaderWrapper
};