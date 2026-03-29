import DefaultTab from "@/components/tab/DefaultTab";
import { ViewType } from "@/core/registry/view-registry";
import { IDockviewPanelHeaderProps } from "dockview";
import { AudioLinesIcon } from "lucide-react";

const AnalogTab = (
  props: IDockviewPanelHeaderProps<{ viewType: ViewType }>,
) => {
  return <DefaultTab title="Analog" icon={AudioLinesIcon} {...props} />;
};

export default AnalogTab;
