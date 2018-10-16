import {Action as AppAction} from 'react/app/design/types';
import {ImportAction, ExportAction} from '../types';

const initImexport = {
    userPatts: [],

    previewId: null,

    previewPatt: null,
};

export default (state = initImexport, action) => {
    switch (action.type) {

        case AppAction.LOAD_PATTERN_COLLECTION_LIST_COMPLETE: {
            let {collections} = action.payload;
            let sortedCollections = collections.slice();
            sortedCollections.sort((a, b) => {
                if(a.fullname.toUpperCase() < b.fullname.toUpperCase()) return -1;
                if(a.fullname.toUpperCase() > b.fullname.toUpperCase()) return 1;
                return 0;
            });
            return Object.assign({}, state, {userPatts: sortedCollections});
        }

        case AppAction.LOAD_PATTERN_COLLECTION_PREVIEW_COMPLETE: {
            let {collectId, pattern} = action.payload;
            return Object.assign({}, state, {previewId: collectId, previewPatt: pattern});
        }

        case AppAction.LOAD_PATTERN_COLLECTION_PREVIEW_ERROR: {
            return Object.assign({}, state, {previewId: null, previewPatt: null});
        }

        case ExportAction.LIST_LOADED: {
            let {userPatts} = action.payload;
            return Object.assign({}, state, {userPatts});
        }

        case ExportAction.PREVIEW_LOADED: {
            let {patt} = action.payload;
            return Object.assign({}, state, {previewId: patt.model.id, previewPatt: patt});
        }

        case ImportAction.RESET:
        case ExportAction.RESET: {
            let state = initImexport;
            return Object.assign({}, state);
        }

        default:
            return state;
    }
};
