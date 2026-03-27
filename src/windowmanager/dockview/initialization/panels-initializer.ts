import { DEFAULT_VIEW_TYPE } from "@/core/registry/view-constants";
import { AddPanelOptions, IDockviewPanel, Parameters } from "dockview";
import { v7 as uuidv7 } from 'uuid';

/**
 * This file is responsible for initializing the panels in the dockview. 
 * For now, it just initializes a single panel with the default view type, 
 * but in the future it will be more dynamic and based on user settings.
 */
const initializePanels = (addPanel: (options: AddPanelOptions<Parameters>) => IDockviewPanel) => {
    addPanel({
        id: generateRandomId(), component: 'default', params: { viewType: "EVENT" }
    });

    addPanel({
        id: generateRandomId(), component: 'default', params: { viewType: "ANALOG" }
    });

    addPanel({
        id: generateRandomId(), component: 'default', params: { viewType: "DIGITAL" }
    });
};

const generateRandomId = (): string => {
    return uuidv7();
}

export default initializePanels;