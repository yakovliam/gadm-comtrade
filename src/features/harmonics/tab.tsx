import DefaultTab from "@/components/tab/DefaultTab";
import { ViewType } from "@/core/registry/view-registry";
import { IDockviewPanelHeaderProps } from "dockview";

const HarmonicsTab = (props: IDockviewPanelHeaderProps<{ viewType: ViewType }>) => {
  return <DefaultTab title="Harmonics" {...props} />;
};

export default HarmonicsTab;
