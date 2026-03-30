import DefaultTab from "@/components/tab/DefaultTab";
import { ViewType } from "@/core/registry/view-registry";
import { IDockviewPanelHeaderProps } from "dockview";
import { FolderIcon } from "lucide-react";

const EventTab = (props: IDockviewPanelHeaderProps<{ viewType: ViewType }>) => {
  return <DefaultTab title="Event Manager" icon={FolderIcon} {...props} />;
};

export default EventTab;
