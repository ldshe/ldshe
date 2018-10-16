import createListReducers from 'react/components/data_list/reducers';
import {initList} from 'react/components/data_list/reducers';
import createSettingsReducers from 'react/design/settings/reducers';
import {initSettings} from 'react/design/settings/reducers';
import {Action, ListType} from './types';

const extInitList = Object.assign({}, initList,
    Object.assign({}, initSettings, {
        currListType: ListType.MY,
        editCollectId: null,
        loadedNum: 0,
    }));

const {list} = createListReducers(Action, extInitList);
const {share} = createSettingsReducers(Action, extInitList);

export const patternList = (state, action) => {
    switch (action.type) {

        case Action.DATA_LOADED: {
            let updState = list(state, action);
            updState.loadedNum += 1;
            return updState;
        }

        case Action.RESET: {
            let state = extInitList;
            return Object.assign({}, state);
        }

        case Action.SWITCH_LIST: {
            const {currListType, data, processedData, pagedData, filterKey, filterVal, searchVal, sortCol, sortDir, page} = action.payload;
            return Object.assign({}, state, {currListType, data, processedData, pagedData, filterKey, filterVal, searchVal, sortCol, sortDir, page});
        }

        case Action.SET_EDIT_COLLECTION: {
            let {editCollectId} = action.payload;
            return Object.assign({}, state, {editCollectId});
        }

        case Action.CLEAR_INFO_LOG: {
            let {infos} = action.payload;
            return Object.assign({}, state, {infos});
        }

        case Action.CLEAR_SUCCESS_LOG: {
            let {success} = action.payload;
            return Object.assign({}, state, {success});
        }

        case Action.CLEAR_ERRORS_LOG: {
            let {errors} = action.payload;
            return Object.assign({}, state, {errors});
        }

        default: {
            let result = share(state, action);
            return result ? result : list(state, action);
        }
    }
};
