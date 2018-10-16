import {Config} from 'js/util';
import {Action as ListBaseAction} from 'react/components/data_list/types';
import {Action as SettingsBaseAction} from 'react/design/settings/types';

export {SortDir} from 'react/components/data_list/types';

export const StateName = {
    DESIGN_LIST: 'designList',
}

const prefix = 'design_list_';
let PrefixedAction = Object.assign({},
    Config.prefixType(ListBaseAction, prefix),
    Config.prefixType(SettingsBaseAction, prefix)
);

export const Action = Object.assign({}, PrefixedAction, {
    SWITCH_LIST: `${prefix}switch_list`,
    SET_EDIT_COURSE: `${prefix}set_edit_course`,
    CONFIGURE_COURSE: `${prefix}configure_course`,
});

export const ListType = {
    MY: 'my',
    GROUP: 'group',
    CURATOR: 'curator',
    PUBLIC: 'public',
    OTHERS: 'others',
    PENDING_REQUESTS: 'pending_requests',
};

export const ContributionRequest = {
    PENDING: 'pending',
    APPROVED: 'approved',
    DENIED: 'denied',
};

let myColumnMeta = [
    {key: 'title', searchable: true, filterable: false, sortable: true},
    {key: 'subject', searchable: true, filterable: true, sortable: true},
    {key: 'teacher', searchable: true, filterable: true, sortable: true},
    {key: 'classSize', searchable: false, filterable: false, sortable: true},
    {key: 'sessionNum', searchable: false, filterable: false, sortable: true},
    {key: 'control', searchable: false, filterable: false, sortable: false},
    {key: 'more', searchable: false, filterable: false, sortable: false},
];

let othersColumnMeta = [
    {key: 'title', searchable: true, filterable: false, sortable: true},
    {key: 'subject', searchable: true, filterable: true, sortable: true},
    {key: 'teacher', searchable: true, filterable: true, sortable: true},
    {key: 'owner', searchable: true, filterable: false, sortable: true},
    {key: 'control', searchable: false, filterable: false, sortable: false},
    {key: 'more', searchable: false, filterable: false, sortable: false},
];

export const ColumnMeta = {
    [ListType.MY]: myColumnMeta,
    [ListType.GROUP]: othersColumnMeta,
    [ListType.CURATOR]: othersColumnMeta,
    [ListType.PUBLIC]: othersColumnMeta,
    [ListType.OTHERS]: othersColumnMeta,
    [ListType.PENDING_REQUESTS]: othersColumnMeta,
}
