import {Config} from 'js/util';
import {Action as SortableListAction} from 'react/components/sortable_list/types';
import {Action as StackedPanelAction} from 'react/components/stacked_panel/types';
import {BaseAction, ADDITIONAL_SETTINGS} from 'react/design/learning_unit/design_panel/types'

export const StateName = {
    PATTERN: 'pattern',
}

export const Action = Object.assign({}, Config.prefixType(BaseAction, 'pattern_collection_'), {
    PARTIAL_UPDATE: 'partial_update',
    ADDITIONAL_SETTINGS_PANEL: Config.prefixType(StackedPanelAction, 'pattern_collection_additional_settings_panel_'),
    ADDITIONAL_SETTINGS: Config.prefixType(SortableListAction, 'pattern_collection_additional_settings_'),
});
