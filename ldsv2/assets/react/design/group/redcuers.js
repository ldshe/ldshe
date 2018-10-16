import {combineReducers} from 'redux';
import panel from './panel/reducers';
import groupList from './group_list/reducers';
import groupItem from './group_item/reducers';
import memberList from './member_list/reducers';

export const userGroup = combineReducers({
    panel,
    groupList,
    groupItem,
    memberList,
});
