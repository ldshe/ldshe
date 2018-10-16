import {Action as AppAction} from 'react/app/design/types';
import {SortDir} from 'react/components/data_list/types';
import createListActions from 'react/components/data_list/actions';
import {Action as ListAction, StateName, ColumnMeta} from './types';

const BaseActions = Object.assign({},
    new createListActions(ListAction, StateName.MEMBER_LIST),
);

export const loadData = (listType, data) => (dispatch, getState) => {
    dispatch(BaseActions.loadData(data, ColumnMeta[listType]));
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
