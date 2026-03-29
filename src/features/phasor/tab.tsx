import DefaultTab from "@/components/tab/DefaultTab";
import { ViewType } from "@/core/registry/view-registry";
import { IDockviewPanelHeaderProps } from "dockview";

const PhasorTab = (props: IDockviewPanelHeaderProps<{ viewType: ViewType }>) => {
  return <DefaultTab title="Phasor" {...props} />;
};

export default PhasorTab;
