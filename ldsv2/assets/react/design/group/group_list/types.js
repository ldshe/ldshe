import {Config} from 'js/util';
import {Action as BaseAction} from 'react/components/data_list/types';

export {SortDir} from 'react/components/data_list/types';

export const StateName = {
    GROUP_LIST: 'userGroup.groupList',
}

const prefix = 'group_list_';
let PrefixedAction = Config.prefixType(BaseAction, prefix);

export const Action = Object.assign({}, PrefixedAction, {
    //Extended actions defined here
});

export const ColumnMeta = [
    {key: 'name', searchable: true, filterable: false, sortable: true},
    {key: 'owner', searchable: true, filterable: false, sortable: true},
    {key: 'size', searchable: false, filterable: false, sortable: true},
    {key: 'control', searchable: false, filterable: false, sortable: false},
];
