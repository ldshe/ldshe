import {Config} from 'js/util';
import {Action as PanelAction} from 'react/components/stacked_panel/types';

export const StateName = {
    LEARNING_UNIT_IMEXPORT_PATTERN: 'learningUnit.imexportPattern',
    LEARNING_UNIT_IMEXPORT_MODAL: 'learningUnit.imexportModal',
}

export const ImportAction = {
    RESET: 'learning_unit_pattern_import_reset',
};

export const ExportAction = {
    RESET: 'learning_unit_pattern_export_reset',
    LIST_LOADED: 'learning_unit_pattern_export_list_loaded',
    PREVIEW_LOADED: 'learning_unit_pattern_export_preview_loaded',
};

export const ModalAction = Object.assign({}, Config.prefixType(PanelAction, 'learning_unit_import_modal_'), {
    REMEMBER_SCROLL: 'remember_scroll',
});

export const Panel = {
    PATTERN_LIST: 'pattern_list',
    PATTERN_PREVIEW: 'pattern_preview',
}

export const PanelType = {
    [Panel.PATTERN_LIST]: {title: 'Patterns'},
    [Panel.PATTERN_PREVIEW]: {title: 'Preview'},
}
