import DefaultTab from "@/components/tab/DefaultTab";
import { ViewType } from "@/core/registry/view-registry";
import { IDockviewPanelHeaderProps } from "dockview";
import { BinaryIcon } from "lucide-react";

const DigitalTab = (
  props: IDockviewPanelHeaderProps<{ viewType: ViewType }>,
) => {
  return <DefaultTab title="Digital" icon={BinaryIcon} {...props} />;
};

export default DigitalTab;
