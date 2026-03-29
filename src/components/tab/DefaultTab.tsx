import { ViewType } from "@/core/registry/view-registry";
import { IDockviewPanelHeaderProps } from "dockview";
import { LucideIcon, XIcon } from "lucide-react";

type DefaultTabProps = IDockviewPanelHeaderProps<{ viewType: ViewType }> & {
  title: string;
  icon?: LucideIcon;
};

const DefaultTab = (props: DefaultTabProps) => {
  const { title, icon: Icon } = props;
  return (
    <div className="grow flex items-center justify-between">
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {title}
      <CloseButton close={() => props.api.close()} />
    </div>
  );
};

const CloseButton = ({ close }: { close: () => void }) => {
  return (
    <button className="ml-2 cursor-pointer hover:bg-gray-600" onClick={close}>
      <XIcon className="w-4 h-4" />
    </button>
  );
};

export default DefaultTab;
