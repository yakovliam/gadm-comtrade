import { DEFAULT_TITLE } from "@/core/registry/view-constants";
import { VIEW_REGISTRY, ViewMetadata, ViewType } from "@/core/registry/view-registry";
import { IDockviewPanelProps } from "dockview";

const DockviewPanelWrapper: React.FC<IDockviewPanelProps<{ viewType: ViewType }>> = (props) => {
    const { viewType } = props.params;
    // get component from registry based on viewType
    const viewMetadata: ViewMetadata = VIEW_REGISTRY[viewType];

    if (!viewType || !viewMetadata) {
        return !viewType ? <NoViewTypeProvided /> : <ViewNotFound viewType={viewType} />;
    }

    // const defaultTitle = viewMetadata.title || DEFAULT_TITLE;
    // props.api.setTitle(defaultTitle);

    const Component = viewMetadata.component;

    return (
        <div className="w-full h-full">
            <Component {...props} />
        </div>
    );
}

const NoViewTypeProvided: React.FC = () => {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500">No view type provided</p>
        </div>
    );
}

const ViewNotFound: React.FC<{ viewType: string }> = ({ viewType }) => {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500">View not found: {viewType}</p>
        </div>
    );
}

export default DockviewPanelWrapper;