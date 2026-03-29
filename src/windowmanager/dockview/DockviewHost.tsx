import { DockviewReact, DockviewReadyEvent, themeVisualStudio } from "dockview";
import { components, tabComponents } from "@/windowmanager/dockview/components/dockview-components-provider";
import initializePanels from "./initialization/panels-initializer";
import EmptyIndex from "@/features/empty";

const DockviewHost: React.FC = () => {
    return (
        <DockviewReact
            theme={themeVisualStudio}
            components={components}
            tabComponents={tabComponents}
            className="w-full h-full"
            onReady={(event: DockviewReadyEvent) => {
                initializePanels((panel) => event.api.addPanel(panel));
            }}
            watermarkComponent={EmptyIndex}
        />
    );
};

export default DockviewHost;