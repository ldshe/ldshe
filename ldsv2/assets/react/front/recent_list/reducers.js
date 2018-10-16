import {Action as AppAction} from 'react/app/front/types';

const initList = {
    designs: [],
    sharedDesigns: [],
    patterns: [],
    sharedPatterns: [],
    groups: [],
}

export const recentList = (state=initList, action) => {
    switch (action.type) {
        case AppAction.LOAD_RECENT_DESIGN_LIST_COMPLETE: {
            let designs = action.payload.data;
            return Object.assign({}, state, {designs});
        }

        case AppAction.LOAD_RECENT_SHARED_DESIGN_LIST_COMPLETE: {
            let sharedDesigns = action.payload.data;
            return Object.assign({}, state, {sharedDesigns});
        }

        case AppAction.LOAD_RECENT_PATTERN_COLLECTION_LIST_COMPLETE: {
            let patterns = action.payload.data;
            return Object.assign({}, state, {patterns});
        }

        case AppAction.LOAD_RECENT_SHARED_PATTERN_COLLECTION_LIST_COMPLETE: {
            let sharedPatterns = action.payload.data;
            return Object.assign({}, state, {sharedPatterns});
        }

        case AppAction.LOAD_RECENT_GROUP_LIST_COMPLETE: {
            let groups = action.payload.data;
            return Object.assign({}, state, {groups});
        }

        default: {
            return state;
        }
    }
};
