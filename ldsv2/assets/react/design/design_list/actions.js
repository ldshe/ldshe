import {Config} from 'js/util';
import {Action as AppAction} from 'react/app/design/types';
import {SortDir} from 'react/components/data_list/types';
import createListActions from 'react/components/data_list/actions';
import createSettingsActions from 'react/design/settings/actions';
import {Action as ListAction, StateName, ColumnMeta} from './types';

const stateName = StateName.DESIGN_LIST;

const BaseActions = Object.assign({},
    new createListActions(ListAction, StateName.DESIGN_LIST),
    new createSettingsActions(ListAction, StateName.DESIGN_LIST)
);

export const switchList = listType => {
    let payload = {
        currListType: listType,
        data: [],
        processedData: [],
        pagedData: [],
        filterKey: '',
        filterVal: '',
        searchVal: '',
        sortCol: 0,
        sortDir: SortDir.ASC,
        page: 1,
    };
    return {type: ListAction.SWITCH_LIST, payload};
}

export const loadData = data => (dispatch, getState) => {
    const state = Config.get(getState(), stateName);
    dispatch(BaseActions.loadData(data, ColumnMeta[state.currListType]));
}

export const setEditCourse = editCourseId => {
    let payload = {editCourseId};
    return {type: ListAction.SET_EDIT_COURSE, payload};
}

export const {
    reset,
    updateFilterOptions,
    jumpNextPage,
    jumpBackPage,
    jumpToPage,
    toggleSortColumn,
    searchContent,
    filterContent,
    clearFilter,
    changeItemNum,
    resetSettings,
} = BaseActions;
