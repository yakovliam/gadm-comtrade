import { DEFAULT_VIEW_TYPE } from "@/core/registry/view-constants";
import { AddPanelOptions, IDockviewPanel, Parameters } from "dockview";
import { v7 as uuidv7 } from "uuid";

/**
 * This file is responsible for initializing the panels in the dockview.
 * For now, it just initializes a single panel with the default view type,
 * but in the future it will be more dynamic and based on user settings.
 */
const initializePanels = (
  addPanel: (options: AddPanelOptions<Parameters>) => IDockviewPanel,
) => {
  const analog1 = addPanel({
    id: generateRandomId(),
    component: "default",
    params: { viewType: "ANALOG" },
    tabComponent: "default",
  });

  const event = addPanel({
    id: generateRandomId(),
    component: "default",
    params: { viewType: DEFAULT_VIEW_TYPE },
    tabComponent: "default",
    position: {
      referencePanel: analog1,
      direction: "right",
    },
    initialWidth: 300,
  });

  const analog2 = addPanel({
    id: generateRandomId(),
    component: "default",
    params: { viewType: "ANALOG" },
    tabComponent: "default",
    position: {
      referencePanel: analog1,
      direction: "below",
    },
  });

  const digital1 = addPanel({
    id: generateRandomId(),
    component: "default",
    params: { viewType: "DIGITAL" },
    tabComponent: "default",
    position: {
      referencePanel: analog2,
      direction: "below",
    },
  });
};

const generateRandomId = (): string => {
  return uuidv7();
};

export default initializePanels;
