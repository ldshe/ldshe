import {Action as AppAction} from 'react/app/design/types';
import createReducers, {initPanel} from 'react/components/stacked_panel/reducers';
import {Panel, ExportAction, ModalAction} from '../types';

const initModal = Object.assign({}, initPanel, {
    panels: [{panel: Panel.PATTERN_LIST}],
    currPanel: {panel: Panel.PATTERN_LIST},
    scrollTop: 0,
    loadedNum: 0,
});

const {panel} = createReducers(ModalAction, initModal);

export default (state, action) => {
    switch (action.type) {

        case AppAction.LOAD_PATTERN_COLLECTION_LIST_POPUP_ERROR:
        case AppAction.IMPORT_PATTERN_ERROR:
        case AppAction.EXPORT_PATTERN_ERROR: {
            let loadedNum = state.loadedNum+1;
            return Object.assign({}, state, {errors, loadedNum});
        }

        case ModalAction.REMEMBER_SCROLL: {
            let {scrollTop} = action.payload;
            return Object.assign({}, state, {scrollTop});
        }

        case AppAction.LOAD_PATTERN_COLLECTION_LIST_COMPLETE:
        case AppAction.LOAD_PATTERN_COLLECTION_PREVIEW_COMPLETE:
        case ExportAction.LIST_LOADED:
        case ExportAction.PREVIEW_LOADED: {
            return Object.assign({}, state, {loadedNum: state.loadedNum+1});
        }

        default:
            return panel(state, action);
    }
};
