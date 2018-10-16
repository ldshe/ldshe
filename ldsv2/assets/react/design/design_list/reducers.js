import createListReducers from 'react/components/data_list/reducers';
import {initList} from 'react/components/data_list/reducers';
import createSettingsReducers from 'react/design/settings/reducers';
import {initSettings} from 'react/design/settings/reducers';
import {Action, ListType} from './types';

const extInitList = Object.assign({}, initList,
    Object.assign({}, initSettings, {
        currListType: ListType.MY,
        editCourseId: null,
        loadedNum: 0,
    }));

const {list} = createListReducers(Action, extInitList);
const {share} = createSettingsReducers(Action, extInitList);

export const designList = (state, action) => {
    switch (action.type) {
        case Action.DATA_LOADED: {
            let updState = list(state, action);
            updState.loadedNum += 1;
            return updState;
        }

        case Action.SWITCH_LIST: {
            const {currListType, data, processedData, pagedData, filterKey, filterVal, searchVal, sortCol, sortDir, page} = action.payload;
            return Object.assign({}, state, {currListType, data, processedData, pagedData, filterKey, filterVal, searchVal, sortCol, sortDir, page});
        }

        case Action.SET_EDIT_COURSE: {
            let {editCourseId} = action.payload;
            return Object.assign({}, state, {editCourseId});
        }

        default: {
            let result = share(state, action);
            return result ? result : list(state, action);
        }
    }
};
