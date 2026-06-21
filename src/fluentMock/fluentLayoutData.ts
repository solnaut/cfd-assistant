import {
  allMainControls,
  allTaskPanels,
  consoleControl,
  graphicsControls,
  outlineFilterControl,
  quickSearchControl,
  ribbonTabs,
  treeSections,
} from './fluentControls'
import { fluentDialogs } from './fluentDialogs'

export const fluentMockLayout = {
  ribbonTabs,
  treeSections,
  taskPanels: allTaskPanels,
  dialogs: fluentDialogs,
  graphicsControls,
  consoleControl,
  outlineFilterControl,
  quickSearchControl,
  allControls: allMainControls,
  defaultPanelId: 'general-panel',
  defaultControlId: 'tree-general',
}
