import {isNumber, isString, Config} from 'js/util';
import {SortDir} from './types';
import DataHandler from './data_handler';

const createActions = function(Action, stateName) {
    this.actions = {
        reset: () => ({type: Action.RESET}),

        loadData: (data, colMeta) => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let handler = new DataHandler(data);
            let total = data.length;
            let processedData = handler.sortDataCol(state.sortCol, state.sortDir, colMeta)
                                       .data();
            let page = Math.min(state.page, Math.ceil(processedData.length/state.itemNum));
            page = page < 1 ? 1 : page;
            let pagedData = handler.pageData(page, state.itemNum)
                                   .data();
            let payload = {data: processedData, processedData, pagedData, page, total, colMeta};
            dispatch(self.updateFilterOptions(processedData, colMeta));
            dispatch({type: Action.DATA_LOADED, payload});
            dispatch(self.applySearchFilter());
        },

        updateFilterOptions: (data, colMeta) => {
            let handler = new DataHandler(data);
            let filterOpts = handler.filterOptions(colMeta);
            let payload = {filterOpts};
            return {type: Action.UPDATE_FILTER_OPTIONS, payload};
        },

        jumpNextPage: () => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let handler = new DataHandler(state.processedData);
            let page = state.page + 1;
            let maxPage = Math.ceil(state.total / state.itemNum);
            page = page > maxPage ? maxPage : page;
            let pagedData = handler.pageData(page, state.itemNum)
                                   .data();
            let payload = {page, pagedData};
            dispatch({type: Action.NEXT, payload});
        },

        jumpBackPage: () => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let handler = new DataHandler(state.processedData);
            let page = state.page - 1;
            page = page < 1 ? 1 : page;
            let pagedData = handler.pageData(page, state.itemNum)
                                   .data();
            let payload = {page, pagedData};
            dispatch({type: Action.BACK, payload});
        },

        jumpToPage: page => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let handler = new DataHandler(state.processedData);
            let pagedData = handler.pageData(page, state.itemNum)
                                   .data();
            let payload = {page, pagedData};
            dispatch({type: Action.JUMP_TO, payload});
        },

        toggleSortColumn: sortCol => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let handler = new DataHandler(state.processedData);
            let sortDir;
            if(state.sortCol != sortCol)
                sortDir = SortDir.ASC
            else
                sortDir = state.sortDir == SortDir.ASC ? SortDir.DESC : SortDir.ASC;
            let processedData = handler.sortDataCol(sortCol, sortDir, state.colMeta)
                                       .data();
            let pagedData = handler.pageData(state.page, state.itemNum)
                                   .data();
            let payload = {sortCol, sortDir, processedData, pagedData};
            dispatch({type: Action.SORT, payload});
        },

        applySearchFilter: () => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let handler = new DataHandler(state.data);
            if(state.searchVal)
                handler.searchData(state.searchVal, state.colMeta);
            if(state.filterKey && state.filterVal)
                handler.filterDataCol(state.filterKey, state.filterVal, state.colMeta);
            let processedData = handler.sortDataCol(state.sortCol, state.sortDir, state.colMeta)
                                       .data();
            let total = processedData.length;
            let page = Math.ceil(total / state.itemNum)
            if(page == 0) page = 1;
            page = state.page > page ? page : state.page;
            let pagedData = handler.pageData(page, state.itemNum)
                                   .data();
            let payload = {processedData, total, page, pagedData};
            dispatch({type: Action.APPLY_SEARCH_FILTER, payload});
        },

        searchContent: searchVal => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let payload = {searchVal};
            dispatch({type: Action.SEARCH, payload});
            dispatch(self.applySearchFilter());
        },

        filterContent: (key, value) => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let payload = {filterKey: key, filterVal: value};
            dispatch({type: Action.FILTER, payload});
            dispatch(self.applySearchFilter());
        },

        clearFilter: () => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let payload = {filterKey: '', filterVal: ''};
            dispatch({type: Action.CLEAR_FILTER, payload});
            dispatch(self.applySearchFilter());
        },

        changeItemNum: itemNum => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let handler = new DataHandler(state.processedData);
            let page = Math.ceil(state.total / itemNum)
            page = state.page == 0 || state.page > page ? page : state.page;
            let pagedData = handler.pageData(page, itemNum)
                                   .data();
            let payload = {itemNum, page, pagedData};
            dispatch({type: Action.CHANGE_ITEM_NUM, payload});
        },
    };
    const self = this.actions;
    return self;
};

export default createActions;
