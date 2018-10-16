import {SortDir} from './types';

export const initList = {
    total: 0,
    itemNum: 10,
    page: 1,
    colMeta: null,
    data: [],
    processedData: [],
    pagedData: [],
    searchVal: '',
    filterOpts: {},
    filterKey: '',
    filterVal: '',
    sortCol: 0,
    sortDir: SortDir.ASC,
};

const createReducers = (Action, initState) => ({
    list: (state = initState ? initState : initList, action) => {
        switch (action.type) {
            case Action.RESET: {
                let state = initState ? initState : initList;
                return Object.assign({}, state);
            }

            case Action.DATA_LOADED: {
                const {data, processedData, pagedData, page, total, colMeta} = action.payload;
                return Object.assign({}, state, {data, processedData, pagedData, page, total, colMeta});
            }

            case Action.UPDATE_FILTER_OPTIONS: {
                const {filterOpts} = action.payload;
                return Object.assign({}, state, {filterOpts});
            }

            case Action.NEXT:
            case Action.BACK:
            case Action.JUMP_TO: {
                const {page, pagedData} = action.payload;
                return Object.assign({}, state, {page, pagedData});
            }

            case Action.SORT: {
                const {sortCol, sortDir, processedData, pagedData} = action.payload;
                return Object.assign({}, state, {sortCol, sortDir, processedData, pagedData});
            }

            case Action.SEARCH: {
                const {searchVal} = action.payload;
                return Object.assign({}, state, {searchVal});
            }

            case Action.FILTER:
            case Action.CLEAR_FILTER: {
                const {filterKey, filterVal} = action.payload;
                return Object.assign({}, state, {filterKey, filterVal});
            }

            case Action.APPLY_SEARCH_FILTER: {
                const {processedData, total, page, pagedData} = action.payload;
                return Object.assign({}, state, {processedData, total, page, pagedData});
            }

            case Action.CHANGE_ITEM_NUM: {
                const {itemNum, pagedData, page} = action.payload;
                return Object.assign({}, state, {itemNum, page, pagedData});
            }

            default:
                return state;
        }
    },
});

export default createReducers;
