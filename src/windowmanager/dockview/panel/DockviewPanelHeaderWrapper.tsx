import { VIEW_REGISTRY, ViewMetadata, ViewType } from "@/core/registry/view-registry";
import { IDockviewPanelHeaderProps } from "dockview";

const DockviewPanelHeaderWrapper: React.FC<IDockviewPanelHeaderProps<{ viewType: ViewType }>> = (props) => {
    const { viewType } = props.params;
    // get component from registry based on viewType
    const viewMetadata: ViewMetadata = VIEW_REGISTRY[viewType];

    const Component = viewMetadata.tabComponent;

    return (
        <div className="relative h-full w-full flex items-center whitespace-nowrap">
            <Component {...props} />
        </div>
    );
}

export default DockviewPanelHeaderWrapper;