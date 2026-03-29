import DefaultTab from "@/components/tab/DefaultTab";
import { ViewType } from "@/core/registry/view-registry";
import { IDockviewPanelHeaderProps } from "dockview";

const EmptyTab = (props: IDockviewPanelHeaderProps<{ viewType: ViewType }>) => {
  return <DefaultTab title="Empty" {...props} />;
};

export default EmptyTab;
