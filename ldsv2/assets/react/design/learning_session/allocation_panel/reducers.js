import {Action as AppAction} from 'react/app/design/types';
import {Action as SessionAction} from './types';

const initSess = {
    data: [],
    allocedLookup: {},
    filter: {},
    editSessId: null,
    scrollTop: 0,
    scrollInnerLeft: 0,
    scrollInnerTop: 0,
    compositeExpanded: {},
    filterExpanded: {},
};

export const learningSession = (state = initSess, action) => {
    switch (action.type) {
        case AppAction.LOAD_DESIGN_COMPLETE: {
            let data = action.payload.data.sessions;
            return Object.assign({}, state, {data});
        }

        case SessionAction.RESET: {
            let state = initSess;
            return Object.assign({}, state);
        }

        case SessionAction.RESTORE: {
            return Object.assign({}, state);
        }

        case SessionAction.ADD_SESSION:
        case SessionAction.REMOVE_SESSION:
        case SessionAction.ADD_STAGE_ITEM:
        case SessionAction.REMOVE_STAGE_ITEM:
        case SessionAction.REMOVE_ALL_STAGE_ITEM:
        case SessionAction.REORDER_STAGE_ITEM:
        case SessionAction.MOVE_STAGE_ITEM:
        case SessionAction.CLEAR_STAGE_ITEM:
        case SessionAction.FIELD_CHANGE: {
            let {data} = action.payload;
            return Object.assign({}, state, {data});
        }

        case SessionAction.EXPAND_STAGE_ITEM: {
            let {compositeExpanded} = action.payload;
            return Object.assign({}, state, {compositeExpanded});
        }

        case SessionAction.UPDATE_ALLOCEDLOOKUP: {
            let {allocedLookup} = action.payload;
            return Object.assign({}, state, {allocedLookup});
        }

        case SessionAction.UPDATE_FILTER: {
            let {filter} = action.payload;
            return Object.assign({}, state, {filter});
        }

        case SessionAction.EXPAND_FILTER_ITEM: {
            let {filterExpanded} = action.payload;
            return Object.assign({}, state, {filterExpanded});
        }

        case SessionAction.LOAD_DETAILS: {
            let {editSessId} = action.payload;
            return Object.assign({}, state, {editSessId});
        }

        case SessionAction.REMEMBER_SCROLL: {
            let {scrollTop, scrollInnerLeft, scrollInnerTop} = action.payload;
            return Object.assign({}, state, {scrollTop, scrollInnerLeft, scrollInnerTop});
        }

        case SessionAction.PARTIAL_UPDATE: {
            let {data} = action.payload;
            return Object.assign({}, state, {data});
        }

        default:
            return state;
    }
};
